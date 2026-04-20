package com.happychicken.app.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @GetMapping({"", "/", "/login"})
    public String login() {
        return "admin/login";
    }

    @GetMapping("/dashboard")
    public String dashboard() {
        return "admin/dashboard";
    }

    @GetMapping({"/productos", "/products"})
    public String products() {
        return "admin/products";
    }

    @GetMapping("/orders")
    public String orders() {
        return "admin/orders";
    }
}
