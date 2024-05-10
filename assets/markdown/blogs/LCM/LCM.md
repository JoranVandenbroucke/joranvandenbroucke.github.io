---
title: 'What is Local Clearance Minimum?'
subTitle: 'LCM, a potential new way to look at navmesh generation.'
pubDate: !!str 2024-08-28
description: 'This blog explains how navigation meshes are typically generated, and what some downsides are. After which a new alternative is explained which has the potential to treat one navigation mesh as many different once.'
image:
  url: '/assets/img/blogs/LCM/LCM.png'
  alt: ';('
author: 'Joran Vandenbroucke'
authorPP: '/assets/img/ProfilePicture.png'
tags: [ "LCM", "Local Clearance Minimum", "Navmesh", "Navigation Mesh" ]
---

# <center><u>**Navigation Meshes**</u></center>

## <center><u>**Chapter 1: What is Local Clearance Minimum**</u></center>

This series of blog posts explains about NavMeshes.
The blogs introduce you to a new concept called `Local Clearance Minimum` (LCM).
After this, the blogs look into how to implement the idea of Recast and discuss the pros and cons of the implementation.
The series explores an exact navmesh generation method, which calculates the medial axis to detect LCMs and create a NavMesh with them.
Finally, the last blog looks into how this affects the way navigation works and shows the pros and cons of it.

The chapter outline is as follows:
1. What is Local Clearance Minimum
2. LCM in Recast (Work in progress)
3. LCM, a custom solution from the ground up (Work in progress)
4. Navigating using the LCM (Work in progress)

### <center><u>Part 1. What is a NavMesh?</u></center>

For a game character to walk around in the environment, they need to know what is walkable and what is not.
A data structure to solve this problem is called a Navigation Mesh (NavMesh).
One could say that a navmesh is the floor plan or a representation of free space for a given environment.
The NavMesh ensures that characters do not walk through obstacles or clip into walls.

Snook gave one of the first definitions of a NavMesh [1].
He defined NavMesh as a coarse geometry that covers the open, walkable surface area [1].
Although Snook was one of the first to define the concept of the NavMesh, he didn't have a methode automatically generate them.

A NavMesh exists out of a set of regions and a connection graph. The regions are sometimes also referred to as cells and
the connections as portals, this then results in a set of cells with a portal graph.

### <center><u>Part 2: How is a NavMesh created?</u></center>
There are a lot of navmesh generation methods, so let us highlight some of them.

Rabin described one of the earliest methods to generate a navmesh.
Rabin wrote in AI Game Programming Wisdom, a methode that could automatically generate a navigation mesh [2].
Rabin's methode uses Hertel Mehlhorn to triangulate the mesh.
Because Hertel Mehlhorn doesn't minimize the number of convex pieces, Rebin added some more steps to reduce the number of regions.

Kallmann created Dynamic and Robust Local Clearance Triangulation[3], also known as Local Clearance Triangulation (LCT).
LCT is based on Fully Dynamic Constrained Delaunay Triangulations by Kallmann et al.
As the name suggests, this uses Delaunay Triangulations to generate the navigation mesh.
It was so fast and efficient that it can add, move, or remove obstacles in real time.
LCT then also adds the concept of clearance, the minimum edge to edge distance, to this.

Now previous methods could be looked at as "exact" methods.
Generally speaking, exact methods have it more difficult with overlapping geometry, and each layer needs to be processed separately.
The next set of methods can be looked at as "voxel" methods.
They voxelize the entire scene and get an understanding of the scene through voxels.
Voxel methods do not need any layer separation, but can miss things like corridors if the voxel size is too small.

One of the voxel methods is Recast [4].
Recast is an open source project which has also found its way into Unreal Engine 5.
This project is based on Volumetric cell-and-portal generation [5] by Haumont et al.
Recast first voxelizes the scene,desides what is walkable and what is not.
Then it keeps everything that is walkable and makes a distance map out of it.
A distance value of one means, there is one cell between me and the closest edge cell, a value of two means two cells are between be and the closest edge cell.
The distance map goes trough a watershed and assigns a region ID to each cell.
The map with region IDs gets traces and converted into a mesh.

Another Voxel methode is NEOGEN: Near optimal generator of navigation meshes for 3D multi-layered environments [6] by Oliva and Pelechano.
NEOGEN tries to create a navmesh with as few convex regions as possible.
A GPU voxelization identefies and extracts different walkable layers.
A fragment shader creats a 2D floor plan of each layer.
Finaly, convex decomposition of each layer is created and linked together to create the final navmesh.

### <center><u>Part 3: How does Local Clearance Minimum come into play?</u></center>


### Bibliography
[1] Greg Snook. 2000. Simplified 3D Movement and Pathfinding Using Navigation Meshes. In Game Programming Gems, Mark DeLoura (ed.). Charles River Media, 288304.
[2] Steve Rabin. 2002. Building a near-optimal navigation mesh. In AI Game Programming Wisdom. Charles River Media, Inc., USA.
[3] Marcelo Kallmann. 2014. Dynamic and Robust Local Clearance Triangulations. ACM Trans. Graph. 33, 5 (September 2014). https://doi.org/10.1145/2580947
[4] 2023. Recast & Detour. Retrieved March 6, 2023 from https://github.com/recastnavigation/recastnavigation
[5] D. Haumont, O. Debeir, and F. Sillion. 2003. Volumetric cell-and-portal generation. Computer Graphics Forum 22, 3 (2003), 303312. https://doi.org/10.1111/1467-8659.00677
[6] R. Oliva and N. Pelechano. 2013. NEOGEN: Near optimal generator of navigation meshes for 3D multi-layered environments. Computers & Graphics 37, 5 (August 2013), 403412. https://doi.org/10.1016/j.cag.2013.03.004
