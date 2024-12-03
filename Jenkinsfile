    pipeline {
        
        agent { label 'decathlon-b2b-slave' }   
        // parameters {
        //     gitParameter branchFilter: 'origin/(.*)', defaultValue: 'master', name: 'BRANCH', type: 'PT_BRANCH'
        // }
        options{
            timestamps()
            buildDiscarder(logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '5', daysToKeepStr: '', numToKeepStr: '5'))
            
        }
        environment {
            DEFAULT_BRANCH = "main"
            gitlab_URL = 'https://gitlab.com/sales_retail/the-sleep-company-admin.git'
          //  credentialsID = '2d9b2367-9d3c-40d3-9102-c1ddabdefe47'
            credentialsID = 'sairam-gitlab-user'
            imageName= 'sleep-company-ui'
        }
        stages {
            stage('git Checkout') {
                steps {
                    script {
                        env.BRANCH_TO_BUILD = DEFAULT_BRANCH
                    }
                    // Get the code from the 'main' branch of a GitHub repository
                    git url: "${env.gitlab_URL}", branch: "${env.BRANCH_TO_BUILD}", credentialsId: "${env.credentialsID}"
                }          
            }

            stage('Stop docker container') {
                steps {
                    sh 'sudo docker-compose down'
                }
            }
            stage('Check and Remove Docker Image') {
                steps {
                    script {
                        def image = "${imageName}"  // Replace with your actual image name and tag
                        def imageExists = sh(script: "sudo docker image ls | grep ${image}", returnStatus: true) == 0

                        if (imageExists) {
                            echo "Docker image ${image} exists. Removing..."
                            sh "sudo docker rmi ${image}"
                        } else {
                            echo "Docker image ${image} is not available. Nothing to remove."
                        }
                    }    
                }
            }
            stage('Run docker container') {
                steps {
                    sh 'sudo docker-compose up -d'
                }
            }
            // stage('Deployment status') {
            //     steps {
            //         sh 'echo Your application is deployed! Please visit the URL to check for changes.'
            //     }
            // } 
        }
        post {   
          success {
              mail bcc: '', body: '''sleep-company-next Pipeline Build is Successfully Completed.

Thanks & Regards,
DevOps Team.''', cc: 'jenkins@theretailinsights.com', from: 'noreply@theretailinsights.com', replyTo: '', subject: 'sleep-company-next build success', to: 'vijay.s@theretailinsights.com'   
          }  
          failure {
              mail bcc: '', body: '''sleep-company-next Pipeline Build is Failed.

Thanks & Regards,
DevOps Team.''', cc: 'jenkins@theretailinsights.com', from: 'noreply@theretailinsights.com', replyTo: '', subject: 'sleep-company-next build failed', to: 'vijay.s@theretailinsights.com'
          } 
        }
      
    }