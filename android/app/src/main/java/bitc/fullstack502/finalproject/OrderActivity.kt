// OrderActivity.kt
package bitc.fullstack502.finalproject

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import bitc.fullstack502.finalproject.databinding.ActivityOrderBinding
import kotlinx.coroutines.launch
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class OrderActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOrderBinding
    private lateinit var adapter: AgencyAdapter
    private lateinit var selectedAdapter: SelectedAdapter

    private var allProducts: List<AgencyProductResponseDTO> = emptyList()
    private var filteredProducts: MutableList<AgencyProductResponseDTO> = mutableListOf()
    private var selectedProducts: MutableList<AgencyProductResponseDTO> = mutableListOf()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOrderBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // 상단 메뉴 클릭
        binding.topBarContainer.menu.setOnClickListener {
            startActivity(Intent(this, MenuActivity::class.java))
        }

        // 주문 등록 버튼 클릭
        binding.btnRegister.setOnClickListener {
            submitOrder()
        }

        setupRecyclerViews()
        setupSearchFilter()
        setupCheckBoxes()
        loadAgencyProducts()
    }

    private fun setupRecyclerViews() {
        adapter = AgencyAdapter { product ->
            moveToSelected(product)
        }
        binding.recyclerView.layoutManager = LinearLayoutManager(this)
        binding.recyclerView.adapter = adapter

        selectedAdapter = SelectedAdapter(
            onRemove = { product ->
                moveToSearch(product)
            }
        )
        binding.selectedRecyclerView.layoutManager = LinearLayoutManager(this)
        binding.selectedRecyclerView.adapter = selectedAdapter
    }

    private fun setupSearchFilter() {
        val etPdNum = binding.etPdNum
        val etPdProducts = binding.etPdProducts
        val textWatcher = object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun afterTextChanged(s: Editable?) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                filterProducts(etPdNum.text.toString(), etPdProducts.text.toString())
            }
        }
        etPdNum.addTextChangedListener(textWatcher)
        etPdProducts.addTextChangedListener(textWatcher)
    }

    private fun setupCheckBoxes() {
        binding.cbCheckAll.setOnClickListener {
            if (filteredProducts.isNotEmpty()) {
                filteredProducts.forEach { it.isSelected = true }
                selectedProducts.addAll(filteredProducts)
                filteredProducts.clear()
                adapter.setItems(filteredProducts)
                selectedAdapter.setItems(selectedProducts)
                updateCounts()
            }
            binding.cbCheckAll.isChecked = false
        }

        binding.cbSelectedAll.setOnClickListener {
            if (selectedProducts.isNotEmpty()) {
                selectedProducts.forEach { it.isSelected = false }
                filteredProducts.addAll(selectedProducts)
                selectedProducts.clear()
                adapter.setItems(filteredProducts)
                selectedAdapter.setItems(selectedProducts)
                updateCounts()
            }
            binding.cbSelectedAll.isChecked = false
        }
    }

    private fun loadAgencyProducts() {
        val retrofit = RetrofitClient.getClient("http://10.0.2.2:8080/")
        val api = retrofit.create(AgencyApi::class.java)
        val token = "Bearer ${getTokenFromPreferences()}"

        val sharedPref = getSharedPreferences("login_pref", MODE_PRIVATE)
        val agKey = sharedPref.getInt("agKey", 0)
        if (agKey == 0) {
            Toast.makeText(this, "대리점 키를 가져올 수 없습니다.", Toast.LENGTH_SHORT).show()
            return
        }

        api.getProductsByAgKey(token, agKey).enqueue(object : Callback<List<AgencyProductResponseDTO>> {
            override fun onResponse(
                call: Call<List<AgencyProductResponseDTO>>,
                response: Response<List<AgencyProductResponseDTO>>
            ) {
                if (response.isSuccessful) {
                    allProducts = response.body()?.distinctBy { it.pdNum } ?: emptyList()
                    filteredProducts = allProducts.toMutableList()
                    adapter.setItems(filteredProducts)
                    updateCounts()
                } else {
                    Toast.makeText(this@OrderActivity, "조회 실패", Toast.LENGTH_SHORT).show()
                    Log.e("OrderActivity", "상품 조회 실패: ${response.code()}, ${response.errorBody()?.string()}")
                }
            }

            override fun onFailure(call: Call<List<AgencyProductResponseDTO>>, t: Throwable) {
                t.printStackTrace()
                Toast.makeText(this@OrderActivity, "서버 오류", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun filterProducts(pdNum: String, pdProducts: String) {
        filteredProducts = allProducts.filter {
            !it.isSelected &&
                    (pdNum.isEmpty() || it.pdNum.contains(pdNum, true)) &&
                    (pdProducts.isEmpty() || it.pdProducts.contains(pdProducts, true))
        }.toMutableList()
        adapter.setItems(filteredProducts)
        updateCounts()
    }

    private fun moveToSelected(product: AgencyProductResponseDTO) {
        if (!selectedProducts.contains(product)) {
            product.isSelected = true
            selectedProducts.add(product)
            filteredProducts.remove(product)
            adapter.setItems(filteredProducts)
            selectedAdapter.setItems(selectedProducts)
            updateCounts()
        }
    }

    private fun moveToSearch(product: AgencyProductResponseDTO) {
        product.isSelected = false
        selectedProducts.remove(product)
        filteredProducts.add(product)
        adapter.setItems(filteredProducts)
        selectedAdapter.setItems(selectedProducts)
        updateCounts()
    }

    private fun updateCounts() {
        binding.tvSearchCount.text = "검색 된 제품 (${filteredProducts.size}개)"
        binding.tvSelectedCount.text = "선택 된 제품 (${selectedProducts.size}개)"
        binding.cbSelectedAll.isChecked = selectedProducts.isNotEmpty()
    }

    private fun getTokenFromPreferences(): String {
        val prefs = getSharedPreferences("login_pref", MODE_PRIVATE)
        return prefs.getString("token", null) ?: ""
    }

    /**
     * 주문 등록 (403 디버깅용 로그 포함)
     */
    private fun submitOrder() {
        if (selectedProducts.isEmpty()) {
            Toast.makeText(this, "선택된 제품이 없습니다.", Toast.LENGTH_SHORT).show()
            return
        }

        // DTO 생성
        val orderList = selectedProducts.map { product ->
            OrderItemRequestDTO(
                pdKey = product.pdKey,
                rdQuantity = product.quantity, // Adapter에서 입력된 수량
                rdPrice = product.pdPrice,
                rdProducts = product.pdProducts,
                rdTotal = product.pdPrice * product.quantity
            )
        }

        val token = "Bearer ${getTokenFromPreferences()}"
        val sharedPref = getSharedPreferences("login_pref", MODE_PRIVATE)
        val agKey = sharedPref.getInt("agKey", 0)
        if (agKey == 0) {
            Toast.makeText(this, "대리점 키를 가져올 수 없습니다.", Toast.LENGTH_SHORT).show()
            return
        }

        // --- 디버깅 로그 ---
        Log.d("OrderActivity", "=== 서버 요청 전 확인 ===")
        Log.d("OrderActivity", "Token: $token")
        Log.d("OrderActivity", "agKey: $agKey")
        orderList.forEach {
            Log.d("OrderActivity", "pdKey=${it.pdKey}, quantity=${it.rdQuantity}, pdPrice=${it.rdPrice}")
        }

        val retrofit = RetrofitClient.getClient("http://10.0.2.2:8080/")
        val api = retrofit.create(AgencyApi::class.java)

        lifecycleScope.launch {
            try {
//                val response = api.registerOrders(token, agKey, orderList)

                val response = api.registerOrders2(token, OrderRequestDTO(agKey, orderList, "2025-10-14"))
                if (response.isSuccessful) {
                    Toast.makeText(this@OrderActivity, "주문 등록 완료", Toast.LENGTH_SHORT).show()

                    // 선택 초기화
                    selectedProducts.clear()
                    selectedAdapter.setItems(selectedProducts)
                    filteredProducts = allProducts.filter { !it.isSelected }.toMutableList()
                    adapter.setItems(filteredProducts)
                    updateCounts()
                } else {
                    val errorBody = response.errorBody()?.string()
                    val message = if (!errorBody.isNullOrEmpty()) {
                        "주문 등록 실패: ${response.code()}, 서버 메시지: $errorBody"
                    } else {
                        "주문 등록 실패: ${response.code()}"
                    }
                    Toast.makeText(this@OrderActivity, message, Toast.LENGTH_LONG).show()
                    Log.e("OrderActivity", message)
                }
            } catch (e: Exception) {
                e.printStackTrace()
                Toast.makeText(this@OrderActivity, "서버 오류 발생: ${e.message}", Toast.LENGTH_LONG).show()
                Log.e("OrderActivity", "Exception during order registration", e)
            }
        }
    }
}
