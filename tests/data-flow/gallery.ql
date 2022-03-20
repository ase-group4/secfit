import javascript

class AllUsageDataFlow extends DataFlow::Configuration {
  AllUsageDataFlow() { this = "AllUsageDataFlow" }

  override predicate isSource(DataFlow::Node source) {
    source instanceof DataFlow::SsaDefinitionNode
  }

  override predicate isSink(DataFlow::Node sink) {
    not sink instanceof DataFlow::SsaDefinitionNode
    // (
    //   sink instanceof DataFlow::ExprNode or
    //   sink instanceof DataFlow::SourceNode or
    //   sink.asExpr() instanceof AssignExpr
    // )
  }
}

from Function func, AllUsageDataFlow flow, DataFlow::PathNode source, DataFlow::PathNode sink
where
  func.getName() = "retrieveWorkoutImages" and
  source.getNode().getContainer() = func and
  flow.hasFlowPath(source, sink)
select source, sink
