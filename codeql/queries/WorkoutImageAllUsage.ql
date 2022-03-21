import javascript

/** Custom configuration for finding data flows with the "All uses" (AU) strategy. */
class AllUsageDataFlow extends DataFlow::Configuration {
  AllUsageDataFlow() { this = "AllUsageDataFlow" }

  /** Defines a data flow's _source_ as a definition of a variable. */
  override predicate isSource(DataFlow::Node source) {
    source instanceof DataFlow::SsaDefinitionNode
  }

  /** Defines a data flow variable's _sink_ as not its definition, i.e. its use. */
  override predicate isSink(DataFlow::Node sink) { not sink instanceof DataFlow::SsaDefinitionNode }
}

// Finds all variables defined in the function `retrieveWorkoutImages`
// that have a data flow path to a use of that variable.
from Function func, AllUsageDataFlow flow, DataFlow::PathNode source, DataFlow::PathNode sink
where
  func.getName() = "retrieveWorkoutImages" and
  source.getNode().getContainer() = func and
  flow.hasFlowPath(source, sink)
select source
