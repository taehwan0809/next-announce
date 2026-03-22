import { createHmac } from 'node:crypto';
import { prisma } from '@/lib/prisma';

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not set.`);
  }

  return value;
}

function getOptionalEnv(name: string) {
  return process.env[name]?.trim() || '';
}

function getCognitoApiBase() {
  return `https://cognito-idp.${getRequiredEnv('COGNITO_REGION')}.amazonaws.com/`;
}

function getCognitoDomainBase() {
  const domain = getRequiredEnv('COGNITO_DOMAIN');
  return domain.startsWith('http') ? domain : `https://${domain}`;
}

function buildSecretHash(username: string) {
  const clientSecret = getOptionalEnv('COGNITO_CLIENT_SECRET');

  if (!clientSecret) {
    return undefined;
  }

  return createHmac('sha256', clientSecret)
    .update(`${username}${getRequiredEnv('COGNITO_CLIENT_ID')}`)
    .digest('base64');
}

async function callCognito<T>(target: string, body: Record<string, unknown>) {
  const response = await fetch(getCognitoApiBase(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': `AWSCognitoIdentityProviderService.${target}`,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as {
      __type?: string;
      message?: string;
    };

    throw new Error(error.message || `Cognito request failed: ${target}`);
  }

  return (await response.json()) as T;
}

export function getOAuthAuthorizeUrl(provider: 'Google' | 'SignInWithApple', state: string) {
  const params = new URLSearchParams({
    identity_provider: provider,
    response_type: 'code',
    client_id: getRequiredEnv('COGNITO_CLIENT_ID'),
    redirect_uri: getRequiredEnv('COGNITO_REDIRECT_URI'),
    scope: 'openid email profile',
    state,
  });

  return `${getCognitoDomainBase()}/oauth2/authorize?${params.toString()}`;
}

export async function signUpWithCognito({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name?: string | null;
}) {
  const secretHash = buildSecretHash(email);

  return callCognito<{
    UserSub: string;
    CodeDeliveryDetails?: { Destination?: string };
  }>('SignUp', {
    ClientId: getRequiredEnv('COGNITO_CLIENT_ID'),
    Username: email,
    Password: password,
    SecretHash: secretHash,
    UserAttributes: [
      { Name: 'email', Value: email },
      ...(name ? [{ Name: 'name', Value: name }] : []),
    ],
  });
}

export async function confirmCognitoSignUp({
  email,
  code,
}: {
  email: string;
  code: string;
}) {
  const secretHash = buildSecretHash(email);

  return callCognito('ConfirmSignUp', {
    ClientId: getRequiredEnv('COGNITO_CLIENT_ID'),
    Username: email,
    ConfirmationCode: code,
    SecretHash: secretHash,
  });
}

export async function loginWithCognito({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const secretHash = buildSecretHash(email);

  return callCognito<{
    AuthenticationResult?: {
      AccessToken: string;
      IdToken: string;
      RefreshToken?: string;
      ExpiresIn: number;
      TokenType: string;
    };
  }>('InitiateAuth', {
    ClientId: getRequiredEnv('COGNITO_CLIENT_ID'),
    AuthFlow: 'USER_PASSWORD_AUTH',
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
      ...(secretHash ? { SECRET_HASH: secretHash } : {}),
    },
  });
}

export async function exchangeAuthorizationCode(code: string) {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: getRequiredEnv('COGNITO_CLIENT_ID'),
    code,
    redirect_uri: getRequiredEnv('COGNITO_REDIRECT_URI'),
  });

  const clientSecret = getOptionalEnv('COGNITO_CLIENT_SECRET');
  if (clientSecret) {
    params.set('client_secret', clientSecret);
  }

  const response = await fetch(`${getCognitoDomainBase()}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Cognito token exchange failed.');
  }

  return (await response.json()) as {
    access_token: string;
    id_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
  };
}

function parseIdToken(idToken: string) {
  return JSON.parse(
    Buffer.from(idToken.split('.')[1], 'base64').toString()
  );
}
export async function upsertCognitoUser({
  sub,
  email,
  name,
  emailVerified,
}: {
  sub: string;
  email: string;
  name?: string | null;
  emailVerified?: boolean;
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name?.trim() || null;

  const existingBySub = await prisma.user.findUnique({
    where: { cognitoSub: sub },
  });

  if (existingBySub) {
    return prisma.user.update({
      where: { id: existingBySub.id },
      data: {
        email: normalizedEmail,
        name: trimmedName ?? existingBySub.name,
        emailVerified: emailVerified ?? existingBySub.emailVerified,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingByEmail) {
    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        cognitoSub: sub,
        name: trimmedName ?? existingByEmail.name,
        emailVerified: emailVerified ?? existingByEmail.emailVerified,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
  }

  return prisma.user.create({
    data: {
      email: normalizedEmail,
      name: trimmedName,
      cognitoSub: sub,
      emailVerified: emailVerified ?? false,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
}
