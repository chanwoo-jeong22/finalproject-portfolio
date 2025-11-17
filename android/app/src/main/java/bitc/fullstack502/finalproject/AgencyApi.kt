package bitc.fullstack502.finalproject

import retrofit2.Call
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface AgencyApi {
    @GET("/api/agency/{agKey}/products/dto")
    fun getProductsByAgKey(
        @Header("Authorization") token: String,
        @Path("agKey") agKey: Int
    ): Call<List<AgencyProductResponseDTO>>

    @POST("/api/agencyorder/orders/{agKey}")
    suspend fun registerOrders(
        @Header("Authorization") token: String,
        @Path("agKey") agKey: Int,
        @Body orders: List<OrderItemRequestDTO>
    ): Response<String>

    @POST("/api/agencyorder/confirm")
    suspend fun registerOrders2(
        @Header("Authorization") token: String,
        @Body request: OrderRequestDTO
    ): Response<OrderDTO>

    @GET("/api/agency/product")
    suspend fun getAgencyProducts(): retrofit2.Response<List<ProductItem>>
}
