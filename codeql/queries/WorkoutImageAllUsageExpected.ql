import javascript

// Finds all variables defined in the function `retrieveWorkoutImages`.
// Used to produce `WorkoutImageAllUsage.expected` for testing main `WorkoutImageAllUsage.ql` query.
from Function func, DataFlow::SsaDefinitionNode source
where
  func.getName() = "retrieveWorkoutImages" and
  source.getContainer() = func
select source
