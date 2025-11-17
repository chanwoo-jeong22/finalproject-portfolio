package bitc.fullstack502.finalproject

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.ViewGroup
import android.widget.EditText
import android.widget.ImageView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class ProductActivity : AppCompatActivity() {

    private lateinit var agencyApi: AgencyApi
    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: ProductAdapter
    private var allProducts: List<ProductItem> = emptyList()

    private lateinit var etSearchNum: EditText
    private lateinit var etSearchName: EditText
    private var agKey: Int = 0  // 로그인 시 가져오는 agKey

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_product)

        // EdgeToEdge padding
        val mainLayout = findViewById<ViewGroup>(R.id.main)
        ViewCompat.setOnApplyWindowInsetsListener(mainLayout) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        // 로그인 정보 가져오기
        val sharedPref = getSharedPreferences("login_pref", Context.MODE_PRIVATE)
        val token = sharedPref.getString("token", null)
        agKey = sharedPref.getInt("agKey", 0)

        if (token == null) {
            Toast.makeText(this, "로그인이 필요합니다.", Toast.LENGTH_SHORT).show()
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }

        // 상단 메뉴
        val topBar = findViewById<ViewGroup>(R.id.top_bar_container)
        topBar?.findViewById<ImageView>(R.id.menu)?.setOnClickListener {
            startActivity(Intent(this, MenuActivity::class.java))
        }

        // 검색창
        etSearchNum = findViewById(R.id.etSearchNum)
        etSearchName = findViewById(R.id.etSearchName)

        // RecyclerView 초기화
        recyclerView = findViewById(R.id.recyclerView)
        recyclerView.layoutManager = LinearLayoutManager(this)
        adapter = ProductAdapter(listOf()) { item ->
            Toast.makeText(this, "${item.pdProducts} 선택됨", Toast.LENGTH_SHORT).show()
        }
        recyclerView.adapter = adapter

        // 검색 이벤트
        etSearchNum.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                filterProducts(etSearchNum.text.toString(), etSearchName.text.toString())
            }
        })
        etSearchName.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                filterProducts(etSearchNum.text.toString(), etSearchName.text.toString())
            }
        })

        // 데이터 로딩
        loadData()
    }

    private fun loadData() {
        lifecycleScope.launch {
            try {
                val retrofit = Retrofit.Builder()
                    .baseUrl("http://10.0.2.2:8080/") // 서버 URL
                    .addConverterFactory(GsonConverterFactory.create())
                    .build()

                agencyApi = retrofit.create(AgencyApi::class.java)

                val response = withContext(Dispatchers.IO) {
                    agencyApi.getAgencyProducts() // List<ProductItem> 반환
                }

                if (response.isSuccessful && response.body() != null) {
                    allProducts = response.body()!!

                    // 로그인한 대리점만 필터
                    val myProducts = allProducts.filter { it.agKey == agKey }

                    Toast.makeText(this@ProductActivity, "총 ${myProducts.size}개 로드", Toast.LENGTH_SHORT).show()

                    adapter.submitList(myProducts)
                } else {
                    Toast.makeText(this@ProductActivity, "데이터 불러오기 실패", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                e.printStackTrace()
                Toast.makeText(this@ProductActivity, "데이터 로딩 실패", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun filterProducts(num: String, name: String) {
        val filtered = allProducts
            .filter { it.agKey == agKey } // 본인 agKey만
            .filter {
                it.pdNum.contains(num, ignoreCase = true) &&
                        it.pdProducts.contains(name, ignoreCase = true)
            }

        adapter.submitList(filtered)
    }
}
