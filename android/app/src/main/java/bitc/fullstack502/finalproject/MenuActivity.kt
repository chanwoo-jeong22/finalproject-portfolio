package bitc.fullstack502.finalproject

import android.content.Intent
import android.os.Bundle
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import bitc.fullstack502.finalproject.databinding.ActivityMenuBinding

class MenuActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMenuBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        binding = ActivityMenuBinding.inflate(layoutInflater)
        setContentView(binding.root)

        ViewCompat.setOnApplyWindowInsetsListener(binding.main) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        val btnOrder = binding.root.findViewById<TextView>(R.id.order)
        val btnOrderProcess = binding.root.findViewById<TextView>(R.id.order_process)
        val btnProduct = binding.root.findViewById<TextView>(R.id.product)
        val btnEsccape = binding.root.findViewById<ImageView>(R.id.escape)

        btnOrder.setOnClickListener {
            startActivity(Intent(this, OrderActivity::class.java))
        }

        btnOrderProcess.setOnClickListener {
            startActivity(Intent(this, OrderProcessActivity::class.java))
        }

        btnProduct.setOnClickListener {
            startActivity(Intent(this, ProductActivity::class.java))
        }

        btnEsccape.setOnClickListener {
            finish()
        }
    }
}
