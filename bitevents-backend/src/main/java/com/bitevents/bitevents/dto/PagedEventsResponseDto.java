package com.bitevents.bitevents.dto;

import com.bitevents.bitevents.model.Event;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PagedEventsResponseDto {
    private List<Event> events;
    private long total;
    private int page;
    private int limit;
    private int totalPages;
}
