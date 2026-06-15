package com.jobportal.backend.controller;

import com.jobportal.backend.entity.Progress;
import com.jobportal.backend.repository.ProgressRepository;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin("*")
public class ProgressController {

    private final ProgressRepository progressRepository;

    public ProgressController(ProgressRepository progressRepository) {
        this.progressRepository = progressRepository;
    }

    @GetMapping
    public List<Progress> getProgress(@RequestParam(required = false) Long userId,
                                      @RequestParam(required = false) Long courseId) {
        if (userId != null) {
            return progressRepository.findByUserId(userId);
        }

        if (courseId != null) {
            return progressRepository.findByCourseId(courseId);
        }

        return progressRepository.findAll();
    }

    @PostMapping
    public Progress saveProgress(@RequestBody Progress progress) {
        Progress target = progressRepository.findByUserIdAndCourseId(progress.getUserId(), progress.getCourseId())
                .orElse(progress);

        target.setStatus(defaultValue(progress.getStatus(), "IN_PROGRESS"));
        target.setCompletionPercentage(defaultNumber(progress.getCompletionPercentage()));
        target.setPerformanceScore(defaultNumber(progress.getPerformanceScore()));
        target.setTimeSpentMinutes(defaultNumber(progress.getTimeSpentMinutes()));
        target.setCurrentModule(progress.getCurrentModule());
        target.setWeakTopics(progress.getWeakTopics());
        target.setSummary(progress.getSummary());
        target.setUserId(progress.getUserId());
        target.setCourseId(progress.getCourseId());
        target.setUpdatedAt(LocalDateTime.now());

        return progressRepository.save(target);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Progress> getProgressById(@PathVariable Long id) {
        return progressRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/summary")
    public Map<String, Object> getSummary(@RequestParam Long userId) {
        List<Progress> rows = progressRepository.findByUserId(userId);
        int total = rows.size();
        double averageCompletion = rows.stream().mapToInt(row -> defaultNumber(row.getCompletionPercentage())).average().orElse(0);
        double averagePerformance = rows.stream().mapToInt(row -> defaultNumber(row.getPerformanceScore())).average().orElse(0);
        long completed = rows.stream().filter(row -> "COMPLETED".equalsIgnoreCase(row.getStatus())).count();
        long lowPerformance = rows.stream().filter(row -> defaultNumber(row.getPerformanceScore()) < 70).count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalCoursesTracked", total);
        summary.put("completedCourses", completed);
        summary.put("averageCompletion", Math.round(averageCompletion));
        summary.put("averagePerformance", Math.round(averagePerformance));
        summary.put("lowPerformanceTopics", lowPerformance);
        summary.put("insight", lowPerformance > 0
                ? "Prioritize revision for weak topics and assign practice modules."
                : "Learning behavior is healthy across tracked courses.");

        return summary;
    }

    private String defaultValue(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private int defaultNumber(Integer value) {
        return value == null ? 0 : value;
    }
}
