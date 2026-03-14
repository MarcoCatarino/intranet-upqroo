-- ===============================
-- DATABASE
-- ===============================

CREATE DATABASE IF NOT EXISTS `intranet-upqroo`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `intranet-upqroo`;

-- ===============================
-- USERS (UUID)
-- ===============================

CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,

    google_id VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    avatar_url TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_users_email (email)
);

-- ===============================
-- DEPARTMENTS
-- ===============================

CREATE TABLE departments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- USER-DEPARTMENT RELATION
-- ===============================

CREATE TABLE department_users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id CHAR(36) NOT NULL,
    department_id INT UNSIGNED NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uniq_user_department (user_id, department_id),

    CONSTRAINT fk_du_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_du_department
        FOREIGN KEY (department_id)
        REFERENCES departments(id)
        ON DELETE CASCADE
);

-- ===============================
-- DOCUMENTS
-- ===============================

CREATE TABLE documents (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(255) NOT NULL,
    description TEXT,

    owner_id CHAR(36) NOT NULL,
    department_id INT UNSIGNED NOT NULL,

    current_version INT UNSIGNED DEFAULT 1,

    deleted_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_documents_owner (owner_id),
    INDEX idx_documents_department (department_id),
    INDEX idx_documents_deleted (deleted_at),

    CONSTRAINT fk_documents_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_documents_department
        FOREIGN KEY (department_id)
        REFERENCES departments(id)
        ON DELETE CASCADE
);

-- ===============================
-- DOCUMENT VERSIONS
-- ===============================

CREATE TABLE document_versions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    document_id BIGINT UNSIGNED NOT NULL,

    version INT UNSIGNED NOT NULL,

    file_path TEXT NOT NULL,

    file_size BIGINT UNSIGNED,

    mime_type VARCHAR(120),

    uploaded_by CHAR(36) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uniq_document_version (document_id, version),

    INDEX idx_document_versions_document (document_id),

    CONSTRAINT fk_dv_document
        FOREIGN KEY (document_id)
        REFERENCES documents(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_dv_user
        FOREIGN KEY (uploaded_by)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- ===============================
-- DOCUMENT PERMISSIONS
-- ===============================

CREATE TABLE document_permissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    document_id BIGINT UNSIGNED NOT NULL,

    user_id CHAR(36) NULL,
    department_id INT UNSIGNED NULL,

    permission ENUM(
        'view',
        'download',
        'upload_version',
        'edit',
        'share'
    ) DEFAULT 'view',

    granted_by CHAR(36) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_permissions_document (document_id),

    UNIQUE KEY uniq_document_user (document_id, user_id),
    UNIQUE KEY uniq_document_department (document_id, department_id),

    CONSTRAINT chk_permission_target
        CHECK (
            (user_id IS NOT NULL AND department_id IS NULL)
            OR
            (user_id IS NULL AND department_id IS NOT NULL)
        ),

    CONSTRAINT fk_permissions_document
        FOREIGN KEY (document_id)
        REFERENCES documents(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_permissions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_permissions_department
        FOREIGN KEY (department_id)
        REFERENCES departments(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_permissions_granted_by
        FOREIGN KEY (granted_by)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- ===============================
-- PERFORMANCE INDEXES
-- ===============================

CREATE INDEX idx_permissions_lookup
ON document_permissions (document_id, user_id, department_id);

CREATE INDEX idx_documents_owner_department
ON documents (owner_id, department_id);

CREATE INDEX idx_versions_doc_version
ON document_versions (document_id, version);