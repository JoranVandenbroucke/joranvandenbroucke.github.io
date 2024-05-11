---
title: 'What is Local Clearance Minimum?'
subTitle: 'Exploring the Concept of Local Clearance Minimum in NavMesh Generation'
pubDate: !!str 2024-05-11
description: 'This series of blog posts delves into the concept of Local Clearance Minimum (LCM) in the context of NavMesh generation. It discusses various methods of NavMesh creation, the challenges posed by different agent sizes, and how LCMs offer a solution to optimize navigation meshes.'
image:
  url: '/assets/img/blogs/LCM/LCM_Banner.png'
  alt: ';('
author: 'Joran Vandenbroucke'
authorPP: '/assets/img/ProfilePicture.png'
tags: [ "LCM", "Local Clearance Minimum", "Navmesh", "Navigation Mesh", "NavMesh Generation", "Pathfinding" ]
---
# Navigation Meshes

## Chapter 1: What is Local Clearance Minimum

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

### Part 1. What is a NavMesh?

For a game character to walk around in the environment, they need to know what is walkable and what is not.
A data structure to solve this problem is called a Navigation Mesh (NavMesh).
One could say that a navmesh is the floor plan or a representation of free space for a given environment.
The NavMesh ensures that characters do not walk through obstacles or clip into walls.

Snook gave one of the first definitions of a NavMesh [[1]](#1).
He defined NavMesh as a coarse geometry that covers the open, walkable surface area [[1]](#1).
Although Snook was one of the first to define the concept of the NavMesh, he didn't have a method to automatically generate them.

A NavMesh exists out of a set of regions and a connection graph. The regions are sometimes also referred to as cells and
the connections as portals, which then results in a set of cells with a portal graph.

### Part 2: How is a NavMesh created?
There are a lot of navmesh generation methods, so let us highlight some of them.

Rabin described one of the earliest methods to generate a navmesh.
Rabin wrote in AI Game Programming Wisdom, a method that could automatically generate a navigation mesh [[2]](#2).
Rabin's method uses Hertel Mehlhorn to triangulate the mesh.
Because Hertel Mehlhorn doesn't minimize the number of convex pieces, Rebin added some more steps to reduce the number of regions.

Kallmann created Dynamic and Robust Local Clearance Triangulation [[3]](#3), also known as Local Clearance Triangulation (LCT).
LCT is based on Fully Dynamic Constrained Delaunay Triangulations by Kallmann et al.
As the name suggests, this uses Delaunay Triangulations to generate the navigation mesh.
It was so fast and efficient that it could add, move, or remove obstacles in real-time.
LCT then also adds the concept of clearance, the minimum edge-to-edge distance, to this.
![Romeo and Juliet (Left), Romeo and Juliet according to LCT (Right)](/assets/img/blogs/LCM/LCM_exactMethods.png "Romeo and Juliet (Left), Romeo and Juliet according to LCT (Right)")
<sup>**Romeo and Juliet (Left), Romeo and Juliet according to LCT (Right)**</sup>

Now previous methods could be looked at as "exact" methods.
Generally speaking, exact methods have it more difficult with overlapping geometry, and each layer needs to be processed separately.
The next set of methods can be looked at as "voxel" methods.
They voxelize the entire scene and get an understanding of the scene through voxels.
Voxel methods do not need any layer separation but can miss things like corridors if the voxel size is too small.

One of the voxel methods is Recast [[4]](#4).
Recast is an open-source project which has also found its way into Unreal Engine 5.
This project is based on Volumetric cell-and-portal generation [[5]](#5) by Haumont et al.
Recast first voxelizes the scene and decides what is walkable and what is not.
Then it keeps everything that is walkable and makes a distance map out of it.
A distance value of one means, there is one cell between me and the closest-edge cell, and a value of two means two cells are between me and the closest-edge cell.
The distance map goes through a watershed and assigns a region ID to each cell.
The map with region IDs gets traces and converted into a mesh.

Another Voxel methode is NEOGEN: Near optimal generator of navigation meshes for 3D multi-layered environments [[6]](#6) by Oliva and Pelechano.
NEOGEN tries to create a navmesh with as few convex regions as possible.
A GPU voxelization identifies and extracts different walkable layers.
A fragment shader creates a 2D-floor plan of each layer.
Finally, a convex decomposition of each layer is created and linked together to create the final navmesh.

### Part 3: How does Local Clearance Minimum come into play?

Oké, now we know some NavMesh generators and have a rough knowledge of how they work.
So, what is the problem?
Well, the problem comes when we want to have agents of different sizes.
Before we generate a navigation mesh, we generally shrink the walkable environment with the radius of the agent and use that as input.
The centre point of that agent can then be put against the border or the NavMesh without worrying that the Agent will clip through walls.
This shrinking of the environment also automatically removes parts of the environment that are smaller than the agent radius.
![A room with an agent in int (left), A room with the agent against the wall (right)](/assets/img/blogs/LCM/NavMeshOffset.png "A room with an agent in int (left), A room with the agent against the wall (right)")
<sup>**This figure shows how the offset helps with navigation and avoiding wall clipping.**</sup>

Because of this, we need multiple navigation meshes when we have agents with different radii.
For games with small environments, this is not a big problem.
But for games that have large open-world maps, this means having multiple representations of the same environment.
So essentially, duplicate memory.

What if we can merge all NavMeshes into one?
Here is where the Local Clearance Minimum comes into play.
The Local Clearance Minimum (LCM) is a point or sequence of points on the medial axis where the distance to obstacles is locally the smallest.
In practical terms, if an area shrinks and then grows, the LCM is where the space is smallest.
An LCM could be in the doorway or an alleyway connecting two main streets.

Instead of splitting up the environment into convex regions, we draw lines on LCMs and that becomes our region borders.
This way, during pathfinding, we just need to check if the agent fits through each LCM.
Using LCMs will get rid of the offset for each agent, but we can add it back during navigating as we often modify the path to make it look more natural anyway.

There are two places a medial axis can be found, one is on a saddle point, and the other is on a saddle segment.
As shown in the image below, the saddle point is a point in a graph where, in one direction is the lowest point, while in the orthogonal direction, it is the highest point on the graph.
The centre part represents a distance map. The centre pixel has a higher value than its neighbours on the x-axis, but it is the smallest pixel when looking at the y-axis.
The same thing is true for the rightmost part of the image. The only difference here is that three neighbouring pixels can be considered as the saddle point; therefore, we call them a saddle segment.
![Saddle point explanation](/assets/img/blogs/LCM/SaddlePointSegment.png "A saddle graph with saddle point as centre point (left), distance map representation of saddle graph (centre), distance map of a saddle segment (right)")
<sup>**A saddle graph with saddle point as centre point (left), distance map representation of saddle graph (centre), distance map of a saddle segment (right)**</sup>


One way to get the LCMs from an environment is to calculate the medial axis of the environment. [[7]](#7)
Then you traverse the medial axis until a saddle point or saddle segment is found.
On that point, you connect the two close boundary points, and you have a region border.
Rinse and repeat until you go over the entire medial axis.

In the next blog post, we will be exploring another method of generating a navmesh using LCMs.
We will be using Recast [[8]](#8), a popular open-source library for NavMesh generation.

### Bibliography
<a id="1">[1]</a> Greg Snook. 2000. Simplified 3D Movement and Pathfinding Using Navigation Meshes. In Game Programming Gems, Mark DeLoura (ed.). Charles River Media, 288304.

<a id="2">[2]</a> Steve Rabin. 2002. Building a near-optimal navigation mesh. In AI Game Programming Wisdom. Charles River Media, Inc., USA.

<a id="3">[3]</a> Marcelo Kallmann. 2014. Dynamic and Robust Local Clearance Triangulations. ACM Trans. Graph. 33, 5 (September 2014). https://doi.org/10.1145/2580947

<a id="4">[4]</a> 2023. Recast & Detour. Retrieved March 6, 2023 from https://github.com/recastnavigation/recastnavigation

<a id="5">[5]</a> D. Haumont, O. Debeir, and F. Sillion. 2003. Volumetric cell-and-portal generation. Computer Graphics Forum 22, 3 (2003), 303312. https://doi.org/10.1111/1467-8659.00677

<a id="6">[6]</a> R. Oliva and N. Pelechano. 2013. NEOGEN: Near optimal generator of navigation meshes for 3D multi-layered environments. Computers & Graphics 37, 5 (August 2013), 403412. https://doi.org/10.1016/j.cag.2013.03.004

<a id="7">[7]</a> Wouter van Toll, Atlas F. Cook IV, and Roland Geraerts. 2011. Navigation Meshes for Realistic Multi-Layered Environments. (September 2011).

<a id="8">[8]</a> 2023. Recast & Detour. Retrieved March 6, 2023 from https://github.com/recastnavigation/recastnavigation
