import javascript

from Function func, DataFlow::SsaDefinitionNode source
where
  func.getName() = "retrieveWorkoutImages" and
  source.getContainer() = func
select source
