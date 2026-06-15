package com.jobportal.backend.repository;

import com.jobportal.backend.entity.Progress;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgressRepository extends JpaRepository<Progress, Long> {
    List<Progress> findByUserId(Long userId);

    List<Progress> findByCourseId(Long courseId);

    Optional<Progress> findByUserIdAndCourseId(Long userId, Long courseId);
}
