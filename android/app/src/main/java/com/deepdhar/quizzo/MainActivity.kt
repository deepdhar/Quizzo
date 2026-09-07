package com.deepdhar.quizzo

import android.os.Bundle
import androidx.activity.OnBackPressedCallback
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import org.devio.rn.splashscreen.SplashScreen

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "Quizzler"

  private var backCallback: OnBackPressedCallback? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    SplashScreen.show(this)
    super.onCreate(null)

    val callback = object : OnBackPressedCallback(true) {
      override fun handleOnBackPressed() {
        if (!reactActivityDelegate.onBackPressed()) {
          isEnabled = false
          onBackPressedDispatcher.onBackPressed()
          isEnabled = true
        }
      }
    }
    backCallback = callback
    onBackPressedDispatcher.addCallback(this, callback)
  }

  override fun invokeDefaultOnBackPressed() {
    backCallback?.isEnabled = false
    try {
      super.invokeDefaultOnBackPressed()
    } finally {
      backCallback?.isEnabled = true
    }
  }

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
