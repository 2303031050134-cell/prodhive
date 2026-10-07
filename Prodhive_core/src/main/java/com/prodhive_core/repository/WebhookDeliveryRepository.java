package com.prodhive_core.repository;

import com.prodhive_core.entity.WebhookDelivery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WebhookDeliveryRepository extends JpaRepository<WebhookDelivery, Long> {
    Optional<WebhookDelivery> findByDeliveryId(String deliveryId);
}