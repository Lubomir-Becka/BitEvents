package com.bitevents.bitevents;

import com.bitevents.bitevents.controller.AuthController;
import com.bitevents.bitevents.controller.EventController;
import com.bitevents.bitevents.controller.VenueController;
import com.bitevents.bitevents.repository.EventRepository;
import com.bitevents.bitevents.repository.UserRepository;
import com.bitevents.bitevents.repository.VenueRepository;
import com.bitevents.bitevents.service.AuthService;
import com.bitevents.bitevents.service.EventService;
import com.bitevents.bitevents.service.UserService;
import com.bitevents.bitevents.service.VenueService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class BiteventsApplicationTests {

	@Autowired
	private ApplicationContext applicationContext;

	@Test
	void contextLoads() {
		assertNotNull(applicationContext);
	}

	@Test
	void allControllersAreLoaded() {
		assertNotNull(applicationContext.getBean(AuthController.class));
		assertNotNull(applicationContext.getBean(EventController.class));
		assertNotNull(applicationContext.getBean(VenueController.class));
	}

	@Test
	void allServicesAreLoaded() {
		assertNotNull(applicationContext.getBean(AuthService.class));
		assertNotNull(applicationContext.getBean(EventService.class));
		assertNotNull(applicationContext.getBean(VenueService.class));
		assertNotNull(applicationContext.getBean(UserService.class));
	}

	@Test
	void allRepositoriesAreLoaded() {
		assertNotNull(applicationContext.getBean(UserRepository.class));
		assertNotNull(applicationContext.getBean(EventRepository.class));
		assertNotNull(applicationContext.getBean(VenueRepository.class));
	}
}
