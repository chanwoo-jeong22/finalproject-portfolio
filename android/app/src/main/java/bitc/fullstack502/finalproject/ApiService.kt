package bitc.fullstack502.finalproject

import retrofit2.Call
import retrofit2.http.POST
import retrofit2.http.Query

interface ApiService {
    @POST("/api/login")
    fun login(
        @Query("sep") sep: String,
        @Query("loginId") loginId: String,
        @Query("loginPw") loginPw: String
    ): Call<Map<String, Any>>
}
