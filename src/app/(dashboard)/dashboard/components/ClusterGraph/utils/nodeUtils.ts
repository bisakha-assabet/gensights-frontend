import type { Node } from "../types"
import type { ClusterPosition } from "../types"

export const createClusterNodes = (clusters: any[], clusterPositions: ClusterPosition[]): Node[] => {
  const nodes: Node[] = []

  clusters?.forEach((cluster, index) => {
    const position = clusterPositions[index]
    nodes.push({
      id: `cluster-${cluster.cluster_id}`,
      type: "cluster",
      label: cluster.title,
      summary: cluster.summary,
      clusterId: cluster.cluster_id,
      x: position.x,
      y: position.y,
      fixedX: position.x,
      fixedY: position.y,
      fx: position.x,
      fy: position.y,
    })
  })

  return nodes
}

export const createQuestionNodes = (questions: any[], clusterNodes: Node[], width: number, height: number): Node[] => {
  const questionNodes: Node[] = []

  console.log("Creating question nodes, total questions:", questions?.length)

  questions?.forEach((question, index) => {
    // Generate a unique ID: prefer case_no, fallback to index-based ID
    const questionId = question.case_no ? `question-${question.case_no}` : `question-idx-${index}`

    console.log("Question ID:", questionId, "case_no:", question.case_no, "clusters:", question.clusters)

    const primaryClusterId = question.clusters[0]
    const clusterNode = clusterNodes.find((n) => n.clusterId === primaryClusterId)

    if (clusterNode) {
      const questionsForCluster = questions.filter((q) => q.clusters.includes(primaryClusterId))
      const questionIndexInCluster = questionsForCluster.findIndex((q) => q === question)
      const angleOffset = (questionIndexInCluster / questionsForCluster.length) * 2 * Math.PI
      const questionRadius = Math.min(width, height) * 0.08

      const qx = (clusterNode.fixedX || 0) + Math.cos(angleOffset) * questionRadius
      const qy = (clusterNode.fixedY || 0) + Math.sin(angleOffset) * questionRadius

      questionNodes.push({
        id: questionId,
        type: "question",
        label: question.question,
        country: question.country_code,
        date: question.case_created_date,
        drug: question.product,
        clusterIds: question.clusters,
        x: qx,
        y: qy,
        fixedX: qx,
        fixedY: qy,
        fx: qx,
        fy: qy,
      })
    } else {
      console.warn("No cluster node found for question:", questionId, "primaryClusterId:", primaryClusterId)
    }
  })

  console.log("Created question nodes:", questionNodes.length)
  return questionNodes
}

export const calculateQuestionPosition = (
  questionIndex: number,
  totalQuestions: number,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
) => {
  let angle, radius

  if (totalQuestions === 1) {
    angle = Math.PI / 2
    radius = Math.min(width, height) * 0.08
  } else if (totalQuestions <= 5) {
    angle = (2 * Math.PI * questionIndex) / totalQuestions
    radius = Math.min(width, height) * 0.12
  } else {
    const questionsPerRing = 8
    const ringIndex = Math.floor(questionIndex / questionsPerRing)
    const positionInRing = questionIndex % questionsPerRing

    angle = (2 * Math.PI * positionInRing) / questionsPerRing
    radius = Math.min(width, height) * (0.06 + ringIndex * 0.03)
  }

  const randomOffset = Math.min(width, height) * 0.02
  const randomAngle = (Math.random() - 0.5) * 0.3
  const randomRadius = (Math.random() - 0.5) * randomOffset

  return {
    x: centerX + Math.cos(angle + randomAngle) * (radius + randomRadius),
    y: centerY + Math.sin(angle + randomAngle) * (radius + randomRadius),
  }
}
