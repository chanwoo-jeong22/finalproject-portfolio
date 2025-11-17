package bitc.fullstack502.finalproject

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class ProductAdapter(
    var items: List<ProductItem>,
    private val onItemClick: (ProductItem) -> Unit
) : RecyclerView.Adapter<ProductAdapter.ViewHolder>() {

    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvPdNum: TextView = view.findViewById(R.id.tvPdNum)
        val tvPdName: TextView = view.findViewById(R.id.tvPdName)
        val tvStock: TextView = view.findViewById(R.id.tvStock)
        val tvApStore: TextView = view.findViewById(R.id.tvApStore)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_product, parent, false)
        return ViewHolder(view)
    }

    override fun getItemCount(): Int = items.size

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val item = items[position]
        holder.tvPdNum.text = item.pdNum
        holder.tvPdName.text = item.pdProducts
        holder.tvStock.text = item.stock.toString()
        holder.tvApStore.text = item.apStore

        holder.itemView.setOnClickListener {
            onItemClick(item)
        }
    }

    fun submitList(newItems: List<ProductItem>) {
        items = newItems
        notifyDataSetChanged()
    }
}
