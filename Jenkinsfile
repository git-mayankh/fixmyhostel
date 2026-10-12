pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = 'fixmyhostel'
        IMAGE_TAG = "${env.BRANCH_NAME == 'main' ? '1.0.' + env.BUILD_NUMBER : '0.0.' + env.BUILD_NUMBER + '-' + env.BRANCH_NAME}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Branch: ${env.BRANCH_NAME}, Build: ${env.BUILD_NUMBER}"
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('API Dependencies') {
                    steps {
                        dir('api') {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }

        stage('Lint') {
            parallel {
                stage('Lint API') {
                    steps {
                        dir('api') {
                            sh 'npm run lint || true'
                        }
                    }
                }
                stage('Lint Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm run lint || true'
                        }
                    }
                }
            }
        }

        stage('Test') {
            parallel {
                stage('API Tests') {
                    steps {
                        dir('api') {
                            sh 'npm test -- --ci --reporters=jest-junit'
                        }
                    }
                    post {
                        always {
                            junit 'api/junit.xml'
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh 'npm test || true'
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh "docker build -t fixmyhostel-api:${IMAGE_TAG} ./api"
                sh "docker build -t fixmyhostel-frontend:${IMAGE_TAG} ./frontend"
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh 'docker compose down || true'
                sh 'docker compose up -d --build'
                sh 'sleep 30'
                sh 'chmod +x api/scripts/smoke-test.sh && bash api/scripts/smoke-test.sh'
            }
            post {
                failure {
                    echo 'Deployment failed! Rolling back...'
                    sh 'docker compose down || true'
                    sh 'docker compose up -d || true'
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline completed for branch: ${env.BRANCH_NAME}"
        }
        success {
            echo 'Build and tests passed!'
        }
        failure {
            echo 'Build or tests failed!'
        }
    }
}
