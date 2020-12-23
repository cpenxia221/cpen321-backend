package com.example.front_end;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.fragment.app.FragmentActivity;

import android.Manifest;
import android.app.Notification;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.MarkerOptions;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Timer;
import java.util.TimerTask;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class location_Activity extends FragmentActivity implements OnMapReadyCallback {

    private GoogleMap mMap;
    protected Location mLastLocation;
    private GoogleApiClient mGoogleApiClient;
    private Button set_Point;
    private Button push_notification;
    private TextView dest_info;
    private Marker marker;
    private boolean if_set = false;
    private static DecimalFormat df = new DecimalFormat("0.00");
    private EditText invitation_user;
    private String invitation_userStr;
    public LatLng dest;
    private app_data app;
    private TextView groupText;
    private TextView buffer;
    private TextView invitBuffer;
    private TextView invitationText;
    private boolean on_notification = false;
    private Button send_invitation;
    private Button Accept;
    private Button Refuse;

    public static final MediaType JSON = MediaType.parse("application/json; charset=utf-8");


    private FusedLocationProviderClient fusedLocationClient;
    final static String TAG = "location_service";

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_location_service);
        app = (app_data) getApplication();


        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager()
                .findFragmentById(R.id.map);
        mapFragment.getMapAsync(this);

        set_Point = findViewById(R.id.btn_set_Point);
        push_notification = findViewById(R.id.btn_push_notification);
        invitation_user = findViewById(R.id.et_invitation);
        groupText = findViewById(R.id.group_info);
        buffer = findViewById(R.id.response_buffer_maps);
        invitBuffer = findViewById(R.id.response2_buffer_maps);
        invitationText = findViewById(R.id.invit_info);
        send_invitation = findViewById(R.id.btn_invite);
        Accept = findViewById(R.id.btn_invitation_accept);
        Refuse = findViewById(R.id.btn_invitation_refuse);
        dest_info = (TextView) findViewById(R.id.dest_info);

        invitBuffer.setText("{\"code\": 401}");

        invitation_user.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                invitation_userStr = s.toString();
            }

            @Override
            public void afterTextChanged(Editable s) {

            }
        });

        // This block keep updating groupinfo.
        new Timer().scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                OkHttpClient client = new OkHttpClient();
                String url = "http://104.210.38.232:8081/get_group";
                String json = "{\"username\": \"" + app.getUsername() + "\"}";
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
                            location_Activity.this.runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                    buffer.setText(responseSt);
                                }
                            });
                        }
                    }
                });
                location_Activity.this.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        //ToDO: change content here
                        groupText.setText(buffer.getText().toString());
                        app.set_groupinfo(buffer.getText().toString());
                    }
                });
            }
        }, 0, 1000);

        //get invitation json
        new Timer().scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                try {
                    JSONObject res_json = new JSONObject(app.get_groupinfo());
                    int groupid = -1;
                    groupid = res_json.getInt("groupid");
                    if (groupid == -1) {

                        OkHttpClient client = new OkHttpClient();
                        String url = "http://104.210.38.232:8081/get_invit";
                        String json = "{\"receiver\": \"" + app.getUsername() + "\"}";
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
                                    location_Activity.this.runOnUiThread(new Runnable() {
                                        @Override
                                        public void run() {
                                            invitBuffer.setText(responseSt);
                                            invitationText.setText(responseSt);
                                        }
                                    });
                                }
                            }
                        });
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        }, 1000, 1000);

        //Change invitation text as needed.
//        new Timer().scheduleAtFixedRate(new TimerTask() {
//            @Override
//            public void run() {
//
//
//                location_Activity.this.runOnUiThread(new Runnable() {
//                    @Override
//                    public void run() {
//                        //ToDO: change content here
//                        invitationText.setText(invitBuffer.getText().toString());
//                    }
//                });
//            }
//        }, 0, 1000);

        //Keep tracking alert
        new Timer().scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {


                try {
                    //String groupinfo = groupText.getText().toString();
                    String groupinfo = app.get_groupinfo();
                    JSONObject res_json = new JSONObject(app.get_groupinfo());
                    boolean on_noti = location_Activity.this.get_if_notification();
                    int if_alert = res_json.getInt("alert");
                    if(if_alert == 1 && !on_noti){
                        location_Activity.this.set_notification(true);
                        final Intent location_service = new Intent(location_Activity.this, com.example.front_end.location_service.class);
                        startService(location_service);
                    }
                    else if(if_alert == 0 && on_noti){
                        location_Activity.this.set_notification(false);
                        final Intent location_service = new Intent(location_Activity.this, com.example.front_end.location_service.class);
                        stopService(location_service);
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }


            }
        }, 0, 1000);

        new Timer().scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                try {
                    JSONObject res_json = new JSONObject(app.get_groupinfo());
                    int groupid = res_json.getInt("groupid");
                    if(groupid != -1 && !get_if_marked()){
                        int lan = res_json.getInt("lantitude");
                        int longti = res_json.getInt("longtitude");
                        if(lan != -1 && longti != -1){
                            set_if_marked(true);
                            final int lan_text =lan;
                            final int longti_text = longti;
                            location_Activity.this.runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                    dest_info.setText("Lat:" + lan_text + "Lng: " + longti_text);
                                }
                            });
                        }
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        }, 0, 1000);

    }

    /**
     * Manipulates the map once available.
     * This callback is triggered when the map is ready to be used.
     * This is where we can add markers or lines, add listeners or move the camera. In this case,
     * we just add a marker near Sydney, Australia.
     * If Google Play services is not installed on the device, the user will be prompted to install
     * it inside the SupportMapFragment. This method will only be triggered once the user has
     * installed Google Play services and returned to the app.
     */
    @Override
    public void onMapReady(GoogleMap googleMap) {
        mMap = googleMap;


        LocationManager mLocationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);

        // If we do not have permission for location, request first.
        while (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED
                && ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(location_Activity.this, new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, 1);
        }

        Location current_Location = mLocationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);

        while (current_Location == null) {
            current_Location = mLocationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
        }

        mMap.moveCamera(CameraUpdateFactory.newLatLng(new LatLng(current_Location.getLatitude(), current_Location.getLongitude())));
        mMap.setMyLocationEnabled(true);
        mMap.setOnMapClickListener(new GoogleMap.OnMapClickListener() {
            @Override
            public void onMapClick(final LatLng latLng) {
                if (marker != null) {
                    marker.remove();
                }
                marker = mMap.addMarker(new MarkerOptions().position(latLng));
            }

        });




        //Event for set point button
        set_Point.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (marker == null) {
                    Toast.makeText(location_Activity.this, "Please click on map to choose destination first!", Toast.LENGTH_SHORT).show();
                    return;
                }
                else if (if_set == false) {
                    dest = new LatLng(marker.getPosition().latitude, marker.getPosition().longitude);
                    marker = mMap.addMarker(new MarkerOptions().position(dest));
                    try {
                        JSONObject res_json = new JSONObject(app.get_groupinfo());
                        String groupid = res_json.getString("groupid");
                        String json = "{\"groupid\": \"" + groupid + "\", \"lantitude\" : \"" + dest.latitude  + "\", \"longtitude\": \"" + dest.longitude + "\"}";
                        OkHttpClient client = new OkHttpClient();
                        String url = "http://104.210.38.232:8081/updateloc";
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
                                }
                            }
                        });
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                    //TODO: update location



                } else {
                    Toast.makeText(location_Activity.this, "Destination has already been set!", Toast.LENGTH_SHORT).show();
                }
            }
        });

        //Event for sending invitation
        send_invitation.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if(invitation_userStr == "")
                    Toast.makeText(location_Activity.this, "Destination username is empty", Toast.LENGTH_SHORT).show();
                else{
                    OkHttpClient client = new OkHttpClient();
                    String url = "http://104.210.38.232:8081/send_invit";
                    String json = "{\"sender\": \"" + app.getUsername() + "\", \"receiver\" : \"" + invitation_userStr  + "\"}";
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

                            }
                        }
                    });
                }
            }
        });

        final Intent location_service = new Intent(location_Activity.this, com.example.front_end.location_service.class);
        push_notification.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                JSONObject res_json = null;
                try {
                    res_json = new JSONObject(app.get_groupinfo());
                    int groupid = res_json.getInt("groupid");
                    if(groupid == -1){
                        Toast.makeText(location_Activity.this, "You should join a group first!", Toast.LENGTH_SHORT).show();
                    }
                    else{
                        OkHttpClient client = new OkHttpClient();
                        String url = "http://104.210.38.232:8081/switchalert";
                        String json = "{\"groupid\": \"" + groupid + "\"}";
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

                                }
                            }
                        });
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }

            }
        });

        Accept.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                try {
                    JSONObject res_json = new JSONObject(invitBuffer.getText().toString());
                    int code = res_json.getInt("code");
                    if(code != 100){
                        Toast.makeText(location_Activity.this, "No such invitation exist", Toast.LENGTH_SHORT).show();
                    }
                    else{
                        String sender = res_json.getString("sender");
                        String receiver = res_json.getString("receiver");
                        String groupid = res_json.getString("groupid");
                        String json = "{\"sender\": \"" + sender + "\", \"receiver\" : \"" + receiver  + "\", \"groupid\": \"" + groupid + "\", \"op\" : \"accept\"}";
                        OkHttpClient client = new OkHttpClient();
                        String url = "http://104.210.38.232:8081/accept_invit";
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

                                }
                            }
                        });
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }

            }
        });
        Refuse.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                try {
                    JSONObject res_json = new JSONObject(invitBuffer.getText().toString());
                    int code = res_json.getInt("code");
                    if(code != 100){
                        Toast.makeText(location_Activity.this, "No such invitation exist", Toast.LENGTH_SHORT).show();
                    }
                    else{
                        String sender = res_json.getString("sender");
                        String receiver = res_json.getString("receiver");
                        String groupid = res_json.getString("groupid");
                        String json = "{\"sender\": \"" + sender + "\", \"receiver\" : \"" + receiver  + "\", \"groupid\": \"" + groupid + "\", \"op\" : \"refuse\"}";
                        OkHttpClient client = new OkHttpClient();
                        String url = "http://104.210.38.232:8081/accept_invit";
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

                                }
                            }
                        });
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }

            }
        });
    }

    public boolean get_if_notification() {
        return this.on_notification;
    }
    public void set_notification(boolean state){
        this.on_notification = state;
    }

    public boolean get_if_marked() {
        return this.if_set;
    }
    public void set_if_marked(boolean state){
        this.if_set = state;
    }
}
