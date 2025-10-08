import type { Link, Node } from "../types"

export const createClusterLinks = (clusters: any[]): Link[] => {
  const links: Link[] = []

  clusters?.forEach((cluster) => {
    if (cluster.cluster_id === 0) {
      if (clusters.find((c) => c.cluster_id === 1)) {
        links.push({
          source: `cluster-${cluster.cluster_id}`,
          target: `cluster-1`,
          clusterId: -1,
        })
      }
      if (clusters.find((c) => c.cluster_id === 2)) {
        links.push({
          source: `cluster-${cluster.cluster_id}`,
          target: `cluster-2`,
          clusterId: -1,
        })
      }
    }

    if (cluster.cluster_id === 1) {
      if (clusters.find((c) => c.cluster_id === 3)) {
        links.push({
          source: `cluster-${cluster.cluster_id}`,
          target: `cluster-3`,
          clusterId: -1,
        })
      }
    }

    if (cluster.cluster_id === 2) {
      if (clusters.find((c) => c.cluster_id === 4)) {
        links.push({
          source: `cluster-${cluster.cluster_id}`,
          target: `cluster-4`,
          clusterId: -1,
        })
      }
    }

    if (cluster.cluster_id === 3 && clusters.find((c) => c.cluster_id === 4)) {
      links.push({
        source: `cluster-${cluster.cluster_id}`,
        target: `cluster-4`,
        clusterId: -1,
      })
    }
  })

  return links
}

export const createQuestionLinks = (questions: any[], clusterNodes: Node[]): Link[] => {
  const links: Link[] = []

  console.log("Creating question links, total questions:", questions?.length)

  questions?.forEach((question, index) => {
    // Generate the same unique ID as in createQuestionNodes
    const questionId = question.case_no ? `question-${question.case_no}` : `question-idx-${index}`

    const primaryClusterId = question.clusters[0]
    const clusterNode = clusterNodes.find((n) => n.clusterId === primaryClusterId)

    if (!clusterNode) {
      console.warn("Skipping links for question:", questionId, "- cluster not found:", primaryClusterId)
      return 
    }

    console.log("Creating links for question:", questionId, "to clusters:", question.clusters)

    question.clusters.forEach((clusterId: number) => {
      const targetCluster = clusterNodes.find((n) => n.clusterId === clusterId)
      if (targetCluster) {
        links.push({
          source: questionId,
          target: `cluster-${clusterId}`,
          clusterId: clusterId,
        })
      } else {
        console.warn("Skipping link to non-existent cluster:", clusterId, "for question:", questionId)
      }
    })
  })

  console.log("Created question links:", links.length)
  return links
}
