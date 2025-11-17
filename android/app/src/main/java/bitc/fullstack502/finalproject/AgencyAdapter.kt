package bitc.fullstack502.finalproject

import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.CheckBox
import android.widget.EditText
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

/**
 * AgencyAdapter
 * - 대리점 상품 리스트를 RecyclerView에 표시
 * - 사용자가 선택하거나 수량을 입력하면 selectedProducts에 실시간 반영
 */
class AgencyAdapter(
    private val onSelect: (AgencyProductResponseDTO) -> Unit
) : RecyclerView.Adapter<AgencyAdapter.ViewHolder>() {

    // Adapter에 표시할 상품 리스트
    private val items = mutableListOf<AgencyProductResponseDTO>()

    /**
     * Adapter에 아이템 세팅
     */
    fun setItems(list: List<AgencyProductResponseDTO>) {
        items.clear()
        items.addAll(list)
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_agency_product, parent, false)
        return ViewHolder(view)
    }

    override fun getItemCount() = items.size

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val product = items[position]
        holder.bind(product)
    }

    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        private val cbSelect: CheckBox = view.findViewById(R.id.cbSelect)
        private val tvPdNum: TextView = view.findViewById(R.id.tvPdNum)
        private val tvPdProducts: TextView = view.findViewById(R.id.tvPdProducts)
        private val etQuantity: EditText = view.findViewById(R.id.etQuantity)
        private val tvPrice: TextView = view.findViewById(R.id.tvPrice)
        private val tvTotal: TextView = view.findViewById(R.id.tvTotal)

        // TextWatcher를 변수로 보관하여 중복 등록 방지
        private var textWatcher: TextWatcher? = null

        /**
         * 뷰에 데이터 바인딩
         */
        fun bind(product: AgencyProductResponseDTO) {
            // 체크박스 상태 세팅
            cbSelect.isChecked = product.isSelected
            tvPdNum.text = product.pdNum
            tvPdProducts.text = product.pdProducts
            tvPrice.text = product.pdPrice.toString()
            tvTotal.text = (product.quantity * product.pdPrice).toString()

            // 기존 TextWatcher 제거 (ViewHolder 재사용 시 중복 방지)
            textWatcher?.let { etQuantity.removeTextChangedListener(it) }

            // 수량 초기화
            etQuantity.setText(if (product.quantity > 0) product.quantity.toString() else "")

            // 새로운 TextWatcher 등록
            textWatcher = object : TextWatcher {
                override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                override fun afterTextChanged(s: Editable?) {}

                override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                    // EditText에서 입력받은 값 파싱
                    val qty = etQuantity.text.toString().toIntOrNull() ?: 0
                    product.quantity = qty
                    // 총액 계산
                    product.total = qty * product.pdPrice
                    tvTotal.text = product.total.toString()

                    Log.d("AgencyAdapter", "pdKey=${product.pdKey}, quantity=${product.quantity}, total=${product.total}")

                }
            }
            etQuantity.addTextChangedListener(textWatcher)

            // 체크박스 클릭 시 선택 상태 변경 및 콜백 호출
            cbSelect.setOnClickListener {
                product.isSelected = cbSelect.isChecked
                onSelect(product) // OrderActivity에서 선택/해제 처리
            }
        }
    }
}
