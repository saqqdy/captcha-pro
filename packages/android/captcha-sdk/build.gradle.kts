plugins {
    id("com.android.library")
    `maven-publish`
}

android {
    namespace = "com.captcha.pro"
    compileSdk = 36
    // AGP 9 defaults to build-tools 36.0.0, which is a half-downloaded stub in
    // this SDK install; 36.1.0 is present and newer. Same note as
    // examples/flutter/android/app/build.gradle.kts.
    buildToolsVersion = "36.1.0"

    defaultConfig {
        minSdk = 21

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        consumerProguardFiles("consumer-rules.pro")
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        viewBinding = true
    }
}

kotlin {
    compilerOptions {
        jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")

    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
}

publishing {
    publications {
        create<MavenPublication>("release") {
            groupId = "com.captcha.pro"
            artifactId = "captcha-sdk"
            version = "2.3.0"

            afterEvaluate {
                // AGP 9 no longer registers the variant component at the point
                // this publication is configured, so look it up lazily instead
                // of failing the whole build when it is absent.
                components.findByName("release")?.let { from(it) }
            }
        }
    }
}
