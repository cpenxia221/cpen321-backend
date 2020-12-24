package com.example.front_end;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import java.io.IOException;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

import org.json.*;

public class Login extends AppCompatActivity {

    public static final MediaType JSON = MediaType.parse("application/json; charset=utf-8");


    private String password = "";
    private String username = "";
    private String responseString = "{\"code\" : -1}";
    private int res_code = -1;

    final static String TAG = "location_service";
    private TextView text1;
    private appData app;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        EditText usrName = (EditText) findViewById(R.id.et_usrname);
        EditText pwd = (EditText) findViewById(R.id.et_pwd);
        app = (appData)getApplication();
        text1 = findViewById(R.id.response_buffer_login);

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
        Button btn_login = findViewById(R.id.btn_login);

        //This block control log in process
        btn_login.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                //Special username for debugging, log in without http request.
                if(username.equals("debug")){
                    Intent intent = new Intent(Login.this, locationActivity.class);
                    startActivity(intent);
                }

                else {
                    OkHttpClient client = new OkHttpClient();
                    String url = "http://104.210.38.232:8081/login";
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
                            if (response.isSuccessful()) {

                                final String responseSt = response.body().string();
                                Login.this.runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        text1.setText(responseSt);
                                    }
                                });

                            }
                        }
                    });
                    //TODO : parse json, if succeed jump.

                    //Parsing Json string here
                    responseString = text1.getText().toString();
                    try {
                        JSONObject res_json = new JSONObject(responseString);
                        res_code = res_json.getInt("code");
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }

                    if (res_code > -1) {
                        app.setUsername(username);
                        Intent intent = new Intent(Login.this, locationActivity.class);
                        startActivity(intent);
                    } else {
                        Toast.makeText(Login.this, "Log in failed: no such username or password!", Toast.LENGTH_SHORT).show();
                    }
                }
            }
        });

    }


}