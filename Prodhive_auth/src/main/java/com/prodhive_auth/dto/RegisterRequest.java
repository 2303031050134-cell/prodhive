package com.prodhive_auth.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public record RegisterRequest(
    String email,
    String password,
    @JsonAlias("name") String fullName,
    String role
) {

}