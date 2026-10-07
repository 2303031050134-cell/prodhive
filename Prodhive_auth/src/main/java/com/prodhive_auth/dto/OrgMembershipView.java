package com.prodhive_auth.dto;

/** One organization the current user belongs to, plus their role in it. Used to render the org switcher / landing page. */
public record OrgMembershipView(Long id, String name, String slug, String role, Long memberCount) {
}
