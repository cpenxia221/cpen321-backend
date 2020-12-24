package com.example.front_end;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.os.StrictMode;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.HttpUrl;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class Registration extends AppCompatActivity {
    public static final MediaType JSON = MediaType.parse("application/json");
    // MediaType.parse("application/json; charset=utf-8");
    private EditText usrName;
    private EditText pwd;
    private EditText confirm_Pwd;
    private String password;
    private String confirm_Password;
    private String username;
    private Button btn_login;
    private TextView text1;
    private String responseString = "{\"code\" : -1}";
    private int res_code = -1;
    private appData app;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_registration);

        StrictMode.ThreadPolicy policy = new StrictMode.ThreadPolicy.Builder().permitAll().build();
        StrictMode.setThreadPolicy(policy);
        app = (appData) getApplication();

        usrName = (EditText) findViewById(R.id.et_usrname_reg);
        pwd = (EditText) findViewById(R.id.et_pwd_reg);
        confirm_Pwd = (EditText) findViewById(R.id.et_confirmpwd);
        text1 = findViewById(R.id.response_buffer_sign_up);

        usrName.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                username = s.toString();
            }

            @Override
            public void afterTextChanged(Editable s) {

            }
        });

        pwd.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                password = s.toString();
            }

            @Override
            public void afterTextChanged(Editable s) {

            }
        });
        confirm_Pwd.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                confirm_Password = s.toString();
            }

            @Override
            public void afterTextChanged(Editable s) {

            }
        });
        btn_login = findViewById(R.id.btn_signUp);
        btn_login.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if(!password.equals(confirm_Password)){
                    Toast.makeText(Registration.this,"Confirm password not equals to password!",Toast.LENGTH_SHORT).show();
                }
                else
                {
                    HttpUrl url = HttpUrl.parse("http://104.210.38.232:8081/reg");
                    OkHttpClient client = new OkHttpClient();
                   // String url = "http://127.0.0.1:8081/reg";
                    String json = "{\"username\": \"" + username + "\", \"password\": \"" + password + "\"}";
                    RequestBody requestBody = RequestBody.create(JSON, json);

                    Request request = new Request.Builder()
                            .url(url)
                            .post(requestBody)
                            .build();
                    client.newCall(request).enqueue(new Callback() {
                        @Override
                        public void onFailure(Call call, IOException e) {
                            e.printStackTrace();
                        }

                        @Override
                        public void onResponse(Call call, Response response) throws IOException {

                            if (response.isSuccessful()){

                                final String responseSt = response.body().string();
                                Registration.this.runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        text1.setText(responseSt);
                                    }
                                });

                            }
                        }});
                    responseString = text1.getText().toString();
                    try {
                        JSONObject res_json = new JSONObject(responseString);
                        res_code = res_json.getInt("code");
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }

                    if(res_code > -1) {
                        app.setUsername(username);
                        Intent intent = new Intent(Registration.this, locationActivity.class);
                        startActivity(intent);
                    }
                    else{
                        Toast.makeText(Registration.this,"Sign up failed: username already exist!",Toast.LENGTH_SHORT).show();
                    }
                }
            }
        });
    }
}