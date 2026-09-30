-- CreateTable
CREATE TABLE `Category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_name_key`(`name`),
    UNIQUE INDEX `Category_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Project` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(160) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `overview` TEXT NULL,
    `role` TEXT NULL,
    `challenge` TEXT NULL,
    `approach` TEXT NULL,
    `process` TEXT NULL,
    `results` TEXT NULL,
    `tags` JSON NULL,
    `evidencePaths` JSON NULL,
    `client` VARCHAR(200) NOT NULL,
    `tools` JSON NOT NULL,
    `coverPath` VARCHAR(500) NOT NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `featuredOrder` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(20) NOT NULL DEFAULT 'published',
    `presentationMode` VARCHAR(40) NOT NULL DEFAULT 'minimal',
    `seoTitle` VARCHAR(200) NULL,
    `seoDescription` TEXT NULL,
    `categoryId` INTEGER NOT NULL,
    `experienceId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Project_slug_key`(`slug`),
    INDEX `Project_status_idx`(`status`),
    INDEX `Project_featured_featuredOrder_idx`(`featured`, `featuredOrder`),
    INDEX `Project_experienceId_idx`(`experienceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectMedia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectId` INTEGER NOT NULL,
    `path` VARCHAR(500) NOT NULL,
    `alt` VARCHAR(255) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProjectMedia_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Experience` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `position` VARCHAR(200) NOT NULL,
    `company` VARCHAR(200) NOT NULL,
    `period` VARCHAR(100) NOT NULL,
    `bullets` JSON NOT NULL,
    `startYear` INTEGER NULL,
    `endYear` INTEGER NULL,
    `domain` VARCHAR(80) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SiteSettings` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `siteName` VARCHAR(120) NOT NULL,
    `personName` VARCHAR(120) NOT NULL,
    `tagline` TEXT NOT NULL,
    `headline` VARCHAR(255) NOT NULL,
    `heroSupporting` TEXT NOT NULL,
    `aboutBio` TEXT NOT NULL,
    `locations` JSON NOT NULL,
    `tools` JSON NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `phoneDisplay` VARCHAR(80) NOT NULL,
    `email` VARCHAR(160) NOT NULL,
    `location` VARCHAR(160) NOT NULL,
    `linkedin` VARCHAR(255) NOT NULL,
    `linkedinHandle` VARCHAR(80) NOT NULL,
    `github` VARCHAR(255) NOT NULL,
    `facebook` VARCHAR(255) NOT NULL,
    `resumePath` VARCHAR(255) NOT NULL,
    `ogImagePath` VARCHAR(255) NOT NULL,
    `canonicalUrl` VARCHAR(255) NOT NULL,
    `gaId` VARCHAR(40) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(100) NOT NULL,
    `lastName` VARCHAR(100) NOT NULL,
    `email` VARCHAR(160) NOT NULL,
    `phone` VARCHAR(50) NULL,
    `body` TEXT NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MetricGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(160) NOT NULL,
    `slug` VARCHAR(180) NOT NULL,
    `description` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `visibility` VARCHAR(20) NOT NULL DEFAULT 'public',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MetricGroup_slug_key`(`slug`),
    INDEX `MetricGroup_visibility_sortOrder_idx`(`visibility`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Metric` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(160) NOT NULL,
    `label` VARCHAR(200) NULL,
    `value` VARCHAR(120) NOT NULL,
    `valueNumeric` DOUBLE NULL,
    `unit` VARCHAR(60) NULL,
    `type` VARCHAR(40) NOT NULL DEFAULT 'count',
    `prefix` VARCHAR(40) NULL,
    `suffix` VARCHAR(40) NULL,
    `startValue` VARCHAR(120) NULL,
    `endValue` VARCHAR(120) NULL,
    `date` DATETIME(3) NULL,
    `category` VARCHAR(80) NULL,
    `visibility` VARCHAR(20) NOT NULL DEFAULT 'public',
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `period` VARCHAR(20) NULL,
    `trendPreference` VARCHAR(30) NOT NULL DEFAULT 'neutral',
    `previousNumeric` DOUBLE NULL,
    `targetNumeric` DOUBLE NULL,
    `baselineNumeric` DOUBLE NULL,
    `decimals` INTEGER NULL,
    `compact` BOOLEAN NOT NULL DEFAULT false,
    `percentScale` VARCHAR(20) NOT NULL DEFAULT 'auto',
    `ratingMax` DOUBLE NULL,
    `metricGroupId` INTEGER NULL,
    `projectId` INTEGER NULL,
    `experienceId` INTEGER NULL,
    `achievementId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Metric_visibility_sortOrder_idx`(`visibility`, `sortOrder`),
    INDEX `Metric_featured_idx`(`featured`),
    INDEX `Metric_metricGroupId_idx`(`metricGroupId`),
    INDEX `Metric_projectId_idx`(`projectId`),
    INDEX `Metric_experienceId_idx`(`experienceId`),
    INDEX `Metric_achievementId_idx`(`achievementId`),
    INDEX `Metric_period_idx`(`period`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MetricDataPoint` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `metricId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `valueNumeric` DOUBLE NULL,
    `value` VARCHAR(120) NULL,
    `label` VARCHAR(120) NULL,
    `metadata` JSON NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MetricDataPoint_metricId_date_idx`(`metricId`, `date`),
    INDEX `MetricDataPoint_metricId_sortOrder_idx`(`metricId`, `sortOrder`),
    UNIQUE INDEX `MetricDataPoint_metricId_date_key`(`metricId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Achievement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(200) NOT NULL,
    `slug` VARCHAR(220) NOT NULL,
    `description` TEXT NOT NULL,
    `type` VARCHAR(60) NOT NULL,
    `date` DATETIME(3) NULL,
    `category` VARCHAR(80) NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(20) NOT NULL DEFAULT 'published',
    `projectId` INTEGER NULL,
    `experienceId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Achievement_slug_key`(`slug`),
    INDEX `Achievement_status_sortOrder_idx`(`status`, `sortOrder`),
    INDEX `Achievement_featured_idx`(`featured`),
    INDEX `Achievement_projectId_idx`(`projectId`),
    INDEX `Achievement_experienceId_idx`(`experienceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Certification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(200) NOT NULL,
    `issuer` VARCHAR(200) NOT NULL,
    `issuedAt` DATETIME(3) NOT NULL,
    `expiresAt` DATETIME(3) NULL,
    `credentialUrl` VARCHAR(500) NULL,
    `imagePath` VARCHAR(500) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Certification_featured_sortOrder_idx`(`featured`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Education` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `institution` VARCHAR(200) NOT NULL,
    `degree` VARCHAR(200) NOT NULL,
    `field` VARCHAR(200) NULL,
    `period` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Skill` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(120) NOT NULL,
    `category` VARCHAR(80) NULL,
    `level` VARCHAR(60) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Skill_name_key`(`name`),
    INDEX `Skill_featured_sortOrder_idx`(`featured`, `sortOrder`),
    INDEX `Skill_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Milestone` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(200) NOT NULL,
    `date` DATETIME(3) NULL,
    `description` TEXT NULL,
    `type` VARCHAR(60) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Milestone_featured_sortOrder_idx`(`featured`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Story` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(180) NOT NULL,
    `scope` VARCHAR(20) NOT NULL,
    `projectId` INTEGER NULL,
    `title` VARCHAR(200) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'draft',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Story_slug_key`(`slug`),
    UNIQUE INDEX `Story_projectId_key`(`projectId`),
    INDEX `Story_scope_status_idx`(`scope`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StoryBlock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `storyId` INTEGER NOT NULL,
    `type` VARCHAR(40) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `title` VARCHAR(200) NULL,
    `subtitle` VARCHAR(255) NULL,
    `body` TEXT NULL,
    `config` JSON NULL,
    `metricId` INTEGER NULL,
    `achievementId` INTEGER NULL,
    `projectMediaId` INTEGER NULL,
    `milestoneId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `StoryBlock_storyId_sortOrder_idx`(`storyId`, `sortOrder`),
    INDEX `StoryBlock_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StoryBlockMetric` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `blockId` INTEGER NOT NULL,
    `metricId` INTEGER NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `StoryBlockMetric_blockId_sortOrder_idx`(`blockId`, `sortOrder`),
    UNIQUE INDEX `StoryBlockMetric_blockId_metricId_key`(`blockId`, `metricId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_experienceId_fkey` FOREIGN KEY (`experienceId`) REFERENCES `Experience`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectMedia` ADD CONSTRAINT `ProjectMedia_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Metric` ADD CONSTRAINT `Metric_metricGroupId_fkey` FOREIGN KEY (`metricGroupId`) REFERENCES `MetricGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Metric` ADD CONSTRAINT `Metric_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Metric` ADD CONSTRAINT `Metric_experienceId_fkey` FOREIGN KEY (`experienceId`) REFERENCES `Experience`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Metric` ADD CONSTRAINT `Metric_achievementId_fkey` FOREIGN KEY (`achievementId`) REFERENCES `Achievement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MetricDataPoint` ADD CONSTRAINT `MetricDataPoint_metricId_fkey` FOREIGN KEY (`metricId`) REFERENCES `Metric`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Achievement` ADD CONSTRAINT `Achievement_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Achievement` ADD CONSTRAINT `Achievement_experienceId_fkey` FOREIGN KEY (`experienceId`) REFERENCES `Experience`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Story` ADD CONSTRAINT `Story_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StoryBlock` ADD CONSTRAINT `StoryBlock_storyId_fkey` FOREIGN KEY (`storyId`) REFERENCES `Story`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StoryBlock` ADD CONSTRAINT `StoryBlock_metricId_fkey` FOREIGN KEY (`metricId`) REFERENCES `Metric`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StoryBlock` ADD CONSTRAINT `StoryBlock_achievementId_fkey` FOREIGN KEY (`achievementId`) REFERENCES `Achievement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StoryBlock` ADD CONSTRAINT `StoryBlock_projectMediaId_fkey` FOREIGN KEY (`projectMediaId`) REFERENCES `ProjectMedia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StoryBlock` ADD CONSTRAINT `StoryBlock_milestoneId_fkey` FOREIGN KEY (`milestoneId`) REFERENCES `Milestone`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StoryBlockMetric` ADD CONSTRAINT `StoryBlockMetric_blockId_fkey` FOREIGN KEY (`blockId`) REFERENCES `StoryBlock`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StoryBlockMetric` ADD CONSTRAINT `StoryBlockMetric_metricId_fkey` FOREIGN KEY (`metricId`) REFERENCES `Metric`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

