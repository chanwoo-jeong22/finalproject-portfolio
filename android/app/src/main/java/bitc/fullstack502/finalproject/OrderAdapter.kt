package bitc.fullstack502.finalproject.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import bitc.fullstack502.finalproject.OrderDTO
import bitc.fullstack502.finalproject.R

class OrderAdapter : RecyclerView.Adapter<OrderAdapter.OrderViewHolder>() {

    private var orders: MutableList<OrderDTO> = mutableListOf()
    private var fullList: MutableList<OrderDTO> = mutableListOf()

    fun setItems(list: List<OrderDTO>) {
        orders.clear()
        orders.addAll(list)
        fullList.clear()
        fullList.addAll(list)
        notifyDataSetChanged()
    }

    fun filter(orderNumber: String?, orderDate: String?, status: String?) {
        val filtered = fullList.filter { order ->
            val matchesNumber = orderNumber.isNullOrBlank() || order.orKey.toString().contains(orderNumber)
            val matchesDate = orderDate.isNullOrBlank() || (order.orDate?.contains(orderDate) == true)
            val matchesStatus = status.isNullOrBlank() || status == "전체" || order.orStatus == status
            matchesNumber && matchesDate && matchesStatus
        }
        orders.clear()
        orders.addAll(filtered)
        notifyDataSetChanged()
    }

    inner class OrderViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val orderDate: TextView = view.findViewById(R.id.tvOrderDate)
        val orderKey: TextView = view.findViewById(R.id.tvOrderKey)
        val orderStatus: TextView = view.findViewById(R.id.tvOrderStatus)
        val orderReserve: TextView = view.findViewById(R.id.tvOrderReserve)
        val dvName: TextView = view.findViewById(R.id.tvDvName)
        val dvPhone: TextView = view.findViewById(R.id.tvDvPhone)
        val orderTotal: TextView = view.findViewById(R.id.tvOrderTotal)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): OrderViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_order, parent, false)
        return OrderViewHolder(view)
    }

    override fun getItemCount(): Int = orders.size

    override fun onBindViewHolder(holder: OrderViewHolder, position: Int) {
        val order = orders[position]
        holder.orderDate.text = order.orDate
        holder.orderKey.text = order.orKey.toString()
        holder.orderStatus.text = order.orStatus
        holder.orderReserve.text = order.orReserve
        holder.dvName.text = order.dvName
        holder.dvPhone.text = order.dvPhone
        holder.orderTotal.text = "${order.orTotal}원"
    }
}
