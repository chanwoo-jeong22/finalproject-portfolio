package bitc.fullstack502.finalproject.api

import bitc.fullstack502.finalproject.OrderDTO
import bitc.fullstack502.finalproject.model.OrderStatus
import retrofit2.Call
import retrofit2.http.GET
import retrofit2.http.Header

interface OrderApi {
    @GET("/api/agencyorder/android")
    fun getOrderDTOList(
        @Header("Authorization") token: String,
        @retrofit2.http.Query("agKey") agKey: Int
    ): Call<List<OrderDTO>>
}
