package com.jobportal.backend.controller;

import com.jobportal.backend.entity.Course;
import com.jobportal.backend.repository.CourseRepository;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin("*")
public class CourseController {

    private final CourseRepository courseRepository;

    public CourseController(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @GetMapping
    public List<Course> getCourses(@RequestParam(required = false) String search) {
        return courseRepository.findAll()
                .stream()
                .filter(course -> matches(course, search))
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourse(@PathVariable Long id) {
        return courseRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Course createCourse(@RequestBody Course course) {
        return courseRepository.save(course);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @RequestBody Course updatedCourse) {
        return courseRepository.findById(id)
                .map(course -> {
                    course.setTitle(updatedCourse.getTitle());
                    course.setCategory(updatedCourse.getCategory());
                    course.setLevel(updatedCourse.getLevel());
                    course.setTotalModules(updatedCourse.getTotalModules());
                    course.setTopics(updatedCourse.getTopics());
                    course.setDescription(updatedCourse.getDescription());
                    return ResponseEntity.ok(courseRepository.save(course));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private boolean matches(Course course, String search) {
        if (search == null || search.isBlank()) {
            return true;
        }

        String needle = search.toLowerCase();
        return contains(course.getTitle(), needle)
                || contains(course.getCategory(), needle)
                || contains(course.getLevel(), needle)
                || contains(course.getTopics(), needle)
                || contains(course.getDescription(), needle);
    }

    private boolean contains(String value, String needle) {
        return value != null && value.toLowerCase().contains(needle);
    }
}
