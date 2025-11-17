package bitc.fullstack502.finalproject

import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

// DTO 예시
data class AgencyDTO(
    val agKey: Int,
    val agCode: Int,
    val agName: String,
    val agCeo: String,
    val agAddress: String,
    val agZip: String,
    val agPhone: String,
    val agEmail: String,
    val agId: String
)

data class ProductDTO(
    val pdKey: Int,
    val pdCategory: String,
    val pdNum: String,
    val pdProducts: String,
    val pdPrice: Int,
    val agKey: Int,
    val stock: Int,     // 재고
    val apStore: String // 최근 입고일
)

interface ProductApi {

    // userId로 Agency 정보 가져오기
    @GET("api/agency/mypage/{id}")
    suspend fun getAgencyInfo(@Path("id") userId: String): AgencyDTO

    // agKey로 Product 리스트 가져오기
    @GET("api/products")
    suspend fun getProducts(@Query("agKey") agKey: Int): List<ProductDTO>
}
