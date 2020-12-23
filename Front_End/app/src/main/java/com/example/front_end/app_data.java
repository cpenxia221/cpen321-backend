package com.example.front_end;

import android.app.Application;

public class app_data extends Application {
    private String username = "";
    private double lantitude = -1;
    private double longtitude = -1;
    private boolean notification_if_on = false;
    private String groupinfo = "{groupid : -1}";
    private String cur_invit = "";

    @Override
    public void onCreate() {
        super.onCreate();
    }

    public void setUsername(String value) {
        this.username = new String(value);
    }

    public String getUsername() {
        return this.username;
    }

    public double get_long() {
        return this.longtitude;
    }

    public double get_lan() {
        return this.lantitude;
    }

    public void set_long(double value) {
        this.longtitude = value;
    }

    public void set_lan(double value) {
        this.lantitude = value;
    }

    public boolean get_notification_state() {
        return this.notification_if_on;
    }

    public void switch_notification_State(boolean state) {
        notification_if_on = state;
    }

    public void set_groupinfo(String json) {
        groupinfo = new String(json);
    }

    public String get_groupinfo() {
        return this.groupinfo;
    }

    public String get_invit() {
        return this.cur_invit;
    }

    public void set_invit(String json) {
        this.cur_invit = new String(json);
    }
}
