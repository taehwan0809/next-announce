-- MySQL 데이터베이스 생성 스크립트
-- 사용법: mysql -u root -p < database-setup.sql

CREATE DATABASE IF NOT EXISTS next_announce
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- 데이터베이스 선택
USE next_announce;

-- 데이터베이스 정보 확인
SELECT
    SCHEMA_NAME as '데이터베이스',
    DEFAULT_CHARACTER_SET_NAME as '문자셋',
    DEFAULT_COLLATION_NAME as 'Collation'
FROM information_schema.SCHEMATA
WHERE SCHEMA_NAME = 'next_announce';
