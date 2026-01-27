# =============================================================================
# AWS Terraform Configuration for ReadLater-AI
# =============================================================================
# This configuration creates:
# - VPC with public/private subnets
# - RDS PostgreSQL database (Free Tier)
# - EC2 instance (Free Tier)
# - Security Groups
# =============================================================================

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "readlater-ai"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
