package com.bitevents.bitevents.repository;

import com.bitevents.bitevents.model.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    @Query(value = "SELECT e.* FROM events e " +
           "JOIN venues v ON v.id = e.venue_id " +
           "WHERE (:search IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(e.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (COALESCE(:cities, NULL) IS NULL OR v.city IN (:cities)) " +
           "AND (:type IS NULL OR e.type = :type)",
           countQuery = "SELECT COUNT(*) FROM events e " +
           "JOIN venues v ON v.id = e.venue_id " +
           "WHERE (:search IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(e.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (COALESCE(:cities, NULL) IS NULL OR v.city IN (:cities)) " +
           "AND (:type IS NULL OR e.type = :type)",
           nativeQuery = true)
    Page<Event> findByFilters(@Param("search") String search,
                               @Param("cities") List<String> cities,
                               @Param("type") String type,
                               Pageable pageable);
}
