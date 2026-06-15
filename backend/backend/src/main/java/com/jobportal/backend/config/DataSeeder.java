package com.jobportal.backend.config;

import com.jobportal.backend.entity.Course;
import com.jobportal.backend.entity.Progress;
import com.jobportal.backend.entity.User;
import com.jobportal.backend.repository.CourseRepository;
import com.jobportal.backend.repository.ProgressRepository;
import com.jobportal.backend.repository.UserRepository;
import java.time.LocalDateTime;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final CourseRepository courseRepository;
    private final ProgressRepository progressRepository;
    private final UserRepository userRepository;

    public DataSeeder(CourseRepository courseRepository,
                      ProgressRepository progressRepository,
                      UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.progressRepository = progressRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        seedUsers();

        if (courseRepository.count() > 0) {
            return;
        }

        Course sql = courseRepository.save(createCourse(
                "PostgreSQL Foundations",
                "Database Systems",
                "Beginner",
                10,
                "SQL, Joins, Indexing, Normalization",
                "Learn schema design, SQL querying, indexing, and relational database implementation."
        ));

        Course spring = courseRepository.save(createCourse(
                "Spring Boot API Security",
                "Backend Development",
                "Intermediate",
                12,
                "JWT, RBAC, REST APIs, Validation",
                "Build secure Spring Boot APIs with JWT authentication and role-based authorization."
        ));

        Course mongo = courseRepository.save(createCourse(
                "MongoDB Learning Analytics",
                "NoSQL and AI",
                "Intermediate",
                8,
                "Learning Logs, Vector Search, Embeddings, Aggregation",
                "Store activity history and run semantic search over learning progress behavior."
        ));

        progressRepository.save(createProgress(1L, sql.getId(), "IN_PROGRESS", 65, 72, "Module 6", "Indexes"));
        progressRepository.save(createProgress(1L, spring.getId(), "NOT_STARTED", 0, 0, "Module 1", "JWT"));
        progressRepository.save(createProgress(1L, mongo.getId(), "IN_PROGRESS", 45, 58, "Module 4", "Vector Search"));
    }

    private void seedUsers() {
        if (userRepository.findByEmail("learner@ps25.local") == null) {
            userRepository.save(new User(null, "Demo Learner", "learner@ps25.local", "password", "USER"));
        }

        if (userRepository.findByEmail("admin@ps25.local") == null) {
            userRepository.save(new User(null, "Demo Admin", "admin@ps25.local", "password", "ADMIN"));
        }
    }

    private Course createCourse(String title,
                                String category,
                                String level,
                                Integer totalModules,
                                String topics,
                                String description) {
        Course course = new Course();
        course.setTitle(title);
        course.setCategory(category);
        course.setLevel(level);
        course.setTotalModules(totalModules);
        course.setTopics(topics);
        course.setDescription(description);
        return course;
    }

    private Progress createProgress(Long userId,
                                    Long courseId,
                                    String status,
                                    Integer completion,
                                    Integer performance,
                                    String currentModule,
                                    String weakTopics) {
        Progress progress = new Progress();
        progress.setUserId(userId);
        progress.setCourseId(courseId);
        progress.setStatus(status);
        progress.setCompletionPercentage(completion);
        progress.setPerformanceScore(performance);
        progress.setTimeSpentMinutes(180);
        progress.setCurrentModule(currentModule);
        progress.setWeakTopics(weakTopics);
        progress.setSummary("Generated seeded progress summary for PS-25 review.");
        progress.setUpdatedAt(LocalDateTime.now());
        return progress;
    }
}
