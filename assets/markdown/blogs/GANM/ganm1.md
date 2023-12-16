---
title: 'Navigating in Geometric Algebra'
subTitle: 'A blog post about Navigation Meshes and AI navigation in games, using Geometric Algebra'
pubDate: !!str 2022-02-12
description: 'A blog post about Navigation Meshes and AI navigation in games, using Geometric Algebra'
image:
  url: '/assets/img/blogs/GART/PlaneRay.bmp'
  alt: ';('
author: 'Joran Vandenbroucke'
authorPP: '/assets/img/ProfilePicture.png'
tags: ["Applied Geometric Algebra", "Geometric Algebra", "AI", "Nav Mesh", "NavMesh", "Navigation Mesh"]
---

# <center><u>**Applied Geometric Algebra**</u></center>
## <center><u>**Chapter 2: Navigation Meshes**</u></center>
Welcome to this series of blog posts where we explore random topics and combine two topics that are usually not combined.
In this chapter, we will dive into the world of Geometric Algebra and Navigation Meshes.
</br>
</br>
For this navigation mesh generator, we will mainly focus on existing navigation mesh generators using geometric algebra.
At the end of the series we will try to write a new generator, based on everything that we learned so far.
After which I would also like to discuss some traversal techniques.
Therefore, a background in math or geometry is recommended.
</br>
</br>
We will use C++ as the implementation language and build upon [GLM (OpenGL Math)](https://github.com/g-truc/glm) to make geometric algebra happen.
The math expansion that gets created in this chapter is small and easy to use.
## Prerequisites
This chapter about Geometric Algebra and Ray Tracing works best if you have a background in programming and math.
## Chapter Outline
This chapter consists of six parts:
1. Local Clearance Triangulation
2. NEOGEN: Near Optimal Generator of Navigation Meshes for 3D Multi-Layered Environments.
3. NEOGEN 3D
4. Custom Algorithm
5. Dynamic obstacles
6. Steering behaviours
7. Pathfinding

The full source code of each final project is available [here](#Todo).
# <center><u>Part 1. Local Clearance Triangulation</u></center>
## Geometric Algebra
If you've ever worked with vectors and matrices in math or computer programming, you might be interested to know that there's a newer approach called Geometric Algebra.
In Geometric Algebra, instead of just working with vectors and matrices, you also have a concept called a k-vector, which can represent not just a magnitude and direction like a traditional vector, but also higher-dimensional objects such as planes and volumes.
<br/>
<br/>
To help you understand the differences between traditional vector math and Geometric Algebra, let's take a look at the table below:
<center>

| Traditional          |    Geometric Algebra |
|:---------------------|---------------------:|
| Vector               |               Vector |
| Matrix               |               Matrix |
| $A\cdot B+A\times B$ | $A\cdot B+A\wedge B$ |
| x-axis               |    $\mathbf{e}\_{1}$ |
| y-axis               |    $\mathbf{e}\_{2}$ |
| z-axis               |    $\mathbf{e}\_{3}$ |
| w-axis               |    $\mathbf{e}\_{4}$ |
| yz-plane             |   $\mathbf{e}\_{23}$ |
| zx-plane             |   $\mathbf{e}\_{31}$ |
| xy-plane             |   $\mathbf{e}\_{12}$ |

</center>

As you can see, many of the concepts from traditional vector math, such as vectors and matrices, are also present in Geometric Algebra.
The first difference is the vector product or the geometric product, but in fact they are the same ... sort of.
In vector algebra and in geometric algebra the dot product is the same $A \cdot B = \lVert A \rVert \lVert B \rVert \cos \theta$, the cross product is actually also the same and $$\begin{equation} \lVert A \times B \rVert = \lVert A \rVert \lVert B \rVert \sin \theta \end{equation}$$ while the wedge product looks like $$\begin{equation}\lVert A \wedge B \rVert = \lVert A \rVert \lVert B \rVert \sin \theta\end{equation}$$
<br/>
The different between the cross product ($\times$) and wedge product ($\wedge$) is that the wedge is designed to work with any combination of vectors and multivectors.
What is a multi-vector I hear you say. Well a multi-vector is something you get when two or more vectors are combined using the wedge product ($\wedge$).
If you wedge two vectors, you get a 2-vector, also known as a bi-vector and if you wedge three vectors than you get a 3-vector, a 2-vector can also be wedged with a vector or a 2-vector or a 3-vector, and we can go on and on.
<br/>
<br/>
Now, the second difference, and this is the difference which makes everything possible, is how we call our axis. instead of using $x$, $y$, $z$ and $w$ we use $\mathbf{e}\_{1}$, $\mathbf{e}\_{2}$, $\mathbf{e}\_{3}$ and $\mathbf{e}\_{4}$.
This difference allows us to go beyond four axis without having to think of new axis names, but a bigger difference lies in how we represent the axis.
While $x$, $y$, $z$ and $w$ can be seen as ways to index from a vector as in `myVector.x` is simular to `myVector[x]`, using $\mathbf{e}\_{1}$, $\mathbf{e}\_{2}$, $\mathbf{e}\_{3}$ and $\mathbf{e}\_{4}$ is more like masking things out, like a bitwise mask or a Photoshop mask, this looks the something like `myVector*e1`.
<br/>
Let's generalize Geometric Algebra axis as $\mathbf{e}\_{i}$, $\mathbf{e}\_{i}$ is a vector, how it looks like doesn't matter for us, we will use it like a symbol, just like how $x$, $y$, $z$ and $w$ are also just symbols.
$\mathbf{e}\_{i}$ has a cool property and that is that it squares to either $1$, $-1$ or $0$, so $\mathbf{e}\_{i}^{2} \in [-1,0,1]$. But how do we know what axis squares to what? To answer that question I would refer you to the [Ganja.js cheat-sheets](https://observablehq.com/@enkimute/ganja-js-cheat-sheets)
<br/>
This cheat-sheet shows us per subalgebra a $\R$ followed by three numbers, they tell us how many axis square to one, negative one and zero respectively.
For our case we are interested in 3D Conformal Geometric Algebra and the sheet tels us this is $\R_{4,1,0}$, this mean we have $\mathbf{e}\_{1}$, $\mathbf{e}\_{2}$, $\mathbf{e}\_{3}$ and $\mathbf{e}\_{4}$ which squares to 1, and one axis $\mathbf{e}\_{5}$ which squares to -1.

