package com.prodhive_core.dto;

import java.time.LocalDate;
public record SprintRequest(String name, Long boardId, LocalDate startDate, LocalDate endDate) {

}