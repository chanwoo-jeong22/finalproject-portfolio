package bitc.fullstack502.finalproject

import android.app.DatePickerDialog
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.view.ViewGroup
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.ImageView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.recyclerview.widget.LinearLayoutManager
import bitc.fullstack502.finalproject.adapter.OrderAdapter
import bitc.fullstack502.finalproject.api.OrderApi
import bitc.fullstack502.finalproject.databinding.ActivityOrderProcessBinding
import bitc.fullstack502.finalproject.OrderDTO
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.util.*

class OrderProcessActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOrderProcessBinding
    private lateinit var adapter: OrderAdapter
    private var originalList: MutableList<OrderDTO> = mutableListOf()
    private var loginAgKey: Int = -1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        binding = ActivityOrderProcessBinding.inflate(layoutInflater)
        setContentView(binding.root)

        ViewCompat.setOnApplyWindowInsetsListener(binding.main) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        // 로그인 체크
        val sharedPref = getSharedPreferences("login_pref", Context.MODE_PRIVATE)
        val token = sharedPref.getString("token", null)
        loginAgKey = sharedPref.getInt("agKey", -1)

        if (token.isNullOrEmpty() || loginAgKey == -1) {
            Toast.makeText(this, "로그인이 필요합니다.", Toast.LENGTH_SHORT).show()
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }

        // 상단바 메뉴 버튼
        val topBar = binding.root.findViewById<ViewGroup>(R.id.top_bar_container)
        val menu = topBar.findViewById<ImageView>(R.id.menu)
        menu.setOnClickListener {
            startActivity(Intent(this, MenuActivity::class.java))
        }

        // 날짜 선택
        binding.editTextOrderDate.setOnClickListener {
            val calendar = Calendar.getInstance()
            val datePicker = DatePickerDialog(
                this,
                { _, year, month, day ->
                    val date = String.format("%04d-%02d-%02d", year, month + 1, day)
                    binding.editTextOrderDate.setText(date)
                    applyFilter()
                },
                calendar.get(Calendar.YEAR),
                calendar.get(Calendar.MONTH),
                calendar.get(Calendar.DAY_OF_MONTH)
            )
            datePicker.show()
        }

        // 상태 Spinner
        val statusList = listOf("전체", "승인 대기중", "배송 준비중", "배송 중", "배송완료")
        val spinnerAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, statusList)
        spinnerAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.spinnerStatus.adapter = spinnerAdapter

        // RecyclerView
        adapter = OrderAdapter()
        binding.recyclerView.layoutManager = LinearLayoutManager(this)
        binding.recyclerView.adapter = adapter

        // API로 주문 목록 불러오기
        fetchOrders(token)

        // 검색 입력 이벤트
        binding.editTextOrderNumber.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) = applyFilter()
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })

        binding.spinnerStatus.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>, view: View?, position: Int, id: Long) {
                applyFilter()
            }
            override fun onNothingSelected(parent: AdapterView<*>) {}
        }
    }

    private fun fetchOrders(token: String) {
        val api = RetrofitClient.getClient("http://10.0.2.2:8080/")
            .create(OrderApi::class.java)

        api.getOrderDTOList("Bearer $token", loginAgKey).enqueue(object: Callback<List<OrderDTO>> {
            override fun onResponse(call: Call<List<OrderDTO>>, response: Response<List<OrderDTO>>) {
                if (response.isSuccessful) {
                    val orders = response.body() ?: emptyList()
                    // 로그인한 대리점(agKey) 필터
                    val myOrders = orders.filter { it.agKey == loginAgKey }

                    originalList.clear()
                    originalList.addAll(myOrders)
                    adapter.setItems(originalList)

                    Toast.makeText(this@OrderProcessActivity, "총 ${originalList.size}개 로드", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(this@OrderProcessActivity, "데이터 로드 실패", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<List<OrderDTO>>, t: Throwable) {
                t.printStackTrace()
                Toast.makeText(this@OrderProcessActivity, "API 호출 실패", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun applyFilter() {
        val orderNumber = binding.editTextOrderNumber.text.toString()
        val orderDate = binding.editTextOrderDate.text.toString()
        val status = binding.spinnerStatus.selectedItem.toString()

        adapter.filter(orderNumber, orderDate, status)
    }
}
