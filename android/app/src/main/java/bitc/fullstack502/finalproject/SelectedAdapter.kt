// SelectedAdapter.kt
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

class SelectedAdapter(
    private val onRemove: (AgencyProductResponseDTO) -> Unit
) : RecyclerView.Adapter<SelectedAdapter.ViewHolder>() {

    private var items: MutableList<AgencyProductResponseDTO> = mutableListOf()

    fun setItems(list: MutableList<AgencyProductResponseDTO>) {
        items = list
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

        // TextWatcher 재사용을 위해 변수 선언
        private var textWatcher: TextWatcher? = null

        fun bind(product: AgencyProductResponseDTO) {
            cbSelect.isChecked = product.isSelected
            tvPdNum.text = product.pdNum
            tvPdProducts.text = product.pdProducts
            tvPrice.text = product.pdPrice.toString()

            // 기존 TextWatcher 제거
            textWatcher?.let { etQuantity.removeTextChangedListener(it) }

            // 수량 초기화
            etQuantity.setText(product.quantity.toString())
            tvTotal.text = (product.quantity * product.pdPrice).toString()

            // 새로운 TextWatcher 설정
            textWatcher = object : TextWatcher {
                override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                override fun afterTextChanged(s: Editable?) {}
                override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                    val qty = etQuantity.text.toString().toIntOrNull() ?: 0
                    product.quantity = qty
                    tvTotal.text = (qty * product.pdPrice).toString()

                    Log.d("AgencyAdapter", "pdKey=${product.pdKey}, quantity=${product.quantity}, total=${product.total}")

                }
            }
            etQuantity.addTextChangedListener(textWatcher)

            // 체크박스 클릭 시 선택 해제 및 제거
            cbSelect.setOnClickListener {
                onRemove(product)
            }
        }
    }
}
