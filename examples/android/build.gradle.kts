plugins {
    id("com.android.application") version "9.0.1"
}

android {
    namespace = "com.captcha.pro.sample"
    compileSdk = 36
    // AGP 9 defaults to build-tools 36.0.0, which is a half-downloaded stub in
    // this SDK install; 36.1.0 is present and newer.
    buildToolsVersion = "36.1.0"

    buildFeatures {
        buildConfig = true
    }

    defaultConfig {
        applicationId = "com.captcha.pro.sample"
        minSdk = 24
        versionCode = 1
        versionName = "1.0"

        // Host of the demo backend (server/node on :3001). `10.0.2.2` is the
        // emulator's alias for the host and is not routable from a real device,
        // so override it there:
        //   ./gradlew installDebug -PCAPTCHA_HOST=192.168.26.105   (Wi-Fi)
        //   adb reverse tcp:3001 tcp:3001 + -PCAPTCHA_HOST=localhost (USB)
        val captchaHost = project.findProperty("CAPTCHA_HOST") as String? ?: "10.0.2.2"
        buildConfigField("String", "CAPTCHA_HOST", "\"$captchaHost\"")
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
}

kotlin {
    compilerOptions {
        jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
    }
}

dependencies {
    // Provided by the included build (packages/android :captcha-sdk)
    implementation("com.captcha.pro:captcha-sdk:2.3.0")
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
}
