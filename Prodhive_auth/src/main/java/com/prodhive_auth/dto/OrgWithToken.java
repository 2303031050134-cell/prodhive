package com.prodhive_auth.dto;

import com.prodhive_auth.entity.Organization;

/** Returned after creating, joining or switching organizations: a fresh JWT scoped to that org, so the frontend never needs to log the user out. */
public record OrgWithToken(Organization organization, String role, String token) {
}
