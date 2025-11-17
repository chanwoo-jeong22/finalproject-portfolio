package bitc.fullstack502.finalproject

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import bitc.fullstack502.finalproject.databinding.ActivityLoginBinding
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        ViewCompat.setOnApplyWindowInsetsListener(binding.main) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        binding.btnLogin.setOnClickListener {
            val loginId = binding.etUserId.text.toString()
            val loginPw = binding.etUserPw.text.toString()
            val sep = "agency"

            if (loginId.isBlank() || loginPw.isBlank()) {
                Toast.makeText(this, "아이디와 비밀번호를 입력해주세요.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val apiService = RetrofitClient.getClient("http://10.0.2.2:8080")
                .create(ApiService::class.java)

            apiService.login(sep, loginId, loginPw).enqueue(object : Callback<Map<String, Any>> {
                override fun onResponse(
                    call: Call<Map<String, Any>>,
                    response: Response<Map<String, Any>>
                ) {
                    if (response.isSuccessful && response.body() != null) {
                        val body = response.body()!!  // 여기서 body 선언
                        val token = body["token"].toString()
                        val userId = body["userId"].toString()
                        val agKey = (body["agKey"] as? Double)?.toInt() ?: 0  // 서버에서 숫자가 Double로 올 수도 있음

                        val sharedPref = getSharedPreferences("login_pref", Context.MODE_PRIVATE)
                        with(sharedPref.edit()) {
                            putString("token", token)
                            putString("userId", userId)
                            putInt("agKey", agKey)
                            apply()
                        }

                        Toast.makeText(this@LoginActivity, "로그인 성공: $userId", Toast.LENGTH_SHORT).show()

                        val intent = Intent(this@LoginActivity, OrderActivity::class.java)
                        startActivity(intent)
                        finish()
                    } else {
                        Toast.makeText(this@LoginActivity, "로그인 실패", Toast.LENGTH_SHORT).show()
                    }
                }


                override fun onFailure(call: Call<Map<String, Any>>, t: Throwable) {
                    Toast.makeText(this@LoginActivity, "서버 연결 실패", Toast.LENGTH_SHORT).show()
                }
            })
        }
    }
}