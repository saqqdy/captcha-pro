pluginManagement {
    repositories {
        maven { url = uri("https://maven.aliyun.com/repository/gradle-plugin") }
        maven { url = uri("https://maven.aliyun.com/repository/google") }
        maven { url = uri("https://maven.aliyun.com/repository/public") }
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        maven { url = uri("https://maven.aliyun.com/repository/google") }
        maven { url = uri("https://maven.aliyun.com/repository/public") }
        google()
        mavenCentral()
    }
}
rootProject.name = "captcha-pro-android-example"

// Composite build: explicitly substitute the published coordinate with the
// local :captcha-sdk module in packages/android.
includeBuild("../../packages/android") {
    dependencySubstitution {
        substitute(module("com.captcha.pro:captcha-sdk")).using(project(":captcha-sdk"))
        substitute(module("com.captcha.pro:captcha-compose")).using(project(":captcha-compose"))
    }
}
