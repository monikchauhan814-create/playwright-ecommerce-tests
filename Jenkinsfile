
pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        skipDefaultCheckout()
    }

    environment {
        CI = 'true'
        PLAYWRIGHT_JUNIT_OUTPUT_FILE = 'test-results/jenkins-junit.xml'
    }

    stages {
        stage('Checkout Source') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    node --version
                    npm --version
                    npm ci
                '''
            }
        }

        stage('Verify OpenCart') {
            steps {
                sh '''
                    curl -fsS -o /dev/null http://localhost:8080/
                '''
            }
        }

        stage('Run Playwright API Contract') {
            steps {
                sh '''
                    mkdir -p test-results
                    rm -f test-results/jenkins-junit.xml

                    npx playwright test tests/api/cart-contract.spec.ts \
                      --project=chromium \
                      --reporter=list,junit,html

                    test -s test-results/jenkins-junit.xml
                '''
            }
        }

        stage('Run Cucumber BDD') {
            steps {
                sh '''
                    rm -f test-results/cucumber-junit.xml

                    npx playwright install chromium

                    npx cucumber-js features/cart-api.feature \
                      features/cart-api-db.feature \
                      --require features/step_definitions/cart.steps.cjs \
                      --format progress \
                      --format junit:test-results/cucumber-junit.xml

                    test -s test-results/cucumber-junit.xml
                '''
            }
        }
    }

    post {
        always {
            junit(
                testResults: 'test-results/*-junit.xml',
                allowEmptyResults: true
            )

            archiveArtifacts(
                artifacts: 'playwright-report/**',
                allowEmptyArchive: true
            )
        }
    }
}
