# <center>Applied Geometric Algebra</center>
## <center>Chapter 1: Ray Tracing</center>
In this series of blog posts, we will make applications using Geometric Algebra.
In this chapter, we will handle Ray Tracing. This ray tracing will be a simple single-pass, hard shadow software ray tracer.
I will show everything using c++.
However, you can easily translate the code into other languages.
This chapter will not show how to setup a software ray tracer and therefor a basic understanding in ray tracing is recommended.

This series consists of seven articles.
The full source code of each final project is available here.
 1. Ray Plane Intersection
 2. Ray Sphere Intersection
 3. Ray Triangle Intersection
 4. Shadow Ray
 5. Bounding Volume Hierarchy
### <center>Ray Plane Intersection</center>
This chapter will start with intersection functions because the math behind these the easyist to explane.
First though, we need to know how a Ray and a plane looks like.
#### Ray
For a ray we will use a line, a line is defined as: $a\mathbf{e}\_{01}+b\mathbf{e}\_{02}+c\mathbf{e}\_{03}+d\mathbf{e}\_{23}+e\mathbf{e}\_{31}+f\mathbf{e}\_{12}=0$
Where $a$, $b$ and $c$ represent an infinity line, also called an ideal line, this will decide the position of the line.
While $d$, $e$ and $f$ represent a branch, also known as a line through the origin, this will determine the direction of the line.
<div style="display: flex;justify-content: space-between;">
<pre class="px-1"><code class="language-cpp">struct Line
{
    float m1, m2, m3, m4;  //movement
    float d1, d2, d3, d4;  //direction

    Line() noexcept = default;
    Line( float a, float b, float c, float d, float e, float f ) noexcept
            : d1{ f }
            , d2{ e }
            , d3{ d }
            , d4{ 0.0f }
            , m1{ c }
            , m2{ b }
            , m3{ a }
            , m4{ 0.0f }
    {
    }
};
</code></pre>
<pre class="px-1"><code class="language-cpp">struct Line
{
    vec4 m;  //movement
    vec4 d;  //direction

    Line() noexcept = default;
    Line( float a, float b, float c, float d, float e, float f ) noexcept
            : d{ f, e, d, 0.0f }
            , m{ c, b, a, 0.0f }
    {
    }
};






</code></pre></div>
#### Plane
For a plane, we can use the following definition: $a\mathbf{e}\_{1}+b\mathbf{e}\_{2}+c\mathbf{e}\_{3}+d\mathbf{e}\_{0}=0$
Where $a$, $b$ and $c$ are the direction/normal of the plane, this does not need to be normalized. $d$ is the distance from world origin along the normal.
<div style="display: flex;justify-content: space-between;">
<pre><code class="language-cpp">struct Plane
{
    float a,b,c,d;

    Plane() noexcept = default;
    Plane(float _a, float _b, float _c, float _d)noexcept
            :a{_a}
            ,b{_b}
            ,c{_c}
            ,d{_d}
    {
    }
};
</code></pre>
<pre><code class="language-cpp">struct Plane
{
    vec3 dir
    float dist;

    Plane() noexcept = default;
    Plane(float a, float b, float c, float d)noexcept
            :dir{ a, b, c }
            ,dist{d}
    {
    }
};

</code></pre></div>

# Intersection
The intersection formula is the easiest one, it is the wedge product between the ray and the plane. $$intersection=ray\wedge plane$$
working this out
$$intersection=ray\wedge plane$$
$$(a\mathbf{e}\_{1}+b\mathbf{e}\_{2}+c\mathbf{e}\_{3}+d\mathbf{e}\_{0})\wedge (e\mathbf{e}\_{01}+f\mathbf{e}\_{02}+g\mathbf{e}\_{03}+h\mathbf{e}\_{23}+i\mathbf{e}\_{31}+j\mathbf{e}\_{12})$$
$
ae\mathbf{e}\_{1}\wedge \mathbf{e}\_{01}+af\mathbf{e}\_{1}\wedge \mathbf{e}\_{02}+ag\mathbf{e}\_{1}\wedge \mathbf{e}\_{03}+ah\mathbf{e}\_{1}\wedge \mathbf{e}\_{23}+ai\mathbf{e}\_{1}\wedge \mathbf{e}\_{31}+aj\mathbf{e}\_{1}\wedge \mathbf{e}\_{12}
+be\mathbf{e}\_{2}\wedge \mathbf{e}\_{01}+bf\mathbf{e}\_{2}\wedge \mathbf{e}\_{02}+bg\mathbf{e}\_{2}\wedge \mathbf{e}\_{03}+bh\mathbf{e}\_{2}\wedge \mathbf{e}\_{23}+bi\mathbf{e}\_{2}\wedge \mathbf{e}\_{31}+bj\mathbf{e}\_{2}\wedge \mathbf{e}\_{12}
+ce\mathbf{e}\_{3}\wedge \mathbf{e}\_{01}+cf\mathbf{e}\_{3}\wedge \mathbf{e}\_{02}+cg\mathbf{e}\_{3}\wedge \mathbf{e}\_{03}+ch\mathbf{e}\_{3}\wedge \mathbf{e}\_{23}+ci\mathbf{e}\_{3}\wedge \mathbf{e}\_{31}+cj\mathbf{e}\_{3}\wedge \mathbf{e}\_{12}
+de\mathbf{e}\_{4}\wedge \mathbf{e}\_{01}+df\mathbf{e}\_{4}\wedge \mathbf{e}\_{02}+dg\mathbf{e}\_{4}\wedge \mathbf{e}\_{03}+dh\mathbf{e}\_{4}\wedge \mathbf{e}\_{23}+di\mathbf{e}\_{4}\wedge \mathbf{e}\_{31}+dj\mathbf{e}\_{4}\wedge \mathbf{e}\_{12}
$
<br/>cleaning things up we get<br/>
$point=(bg-cf-dj)\mathbf{e}\_{032}+(-ag+ce-di)\mathbf{e}\_{013}+(af+be-dh)\mathbf{e}\_{021}+(aj+bi+ch)\mathbf{e}\_{123}$
<br/>
in code this looks like
<div style="display: flex;justify-content: space-between;">
<pre><code class="language-cpp">struct Point
{
    float x;
    float y;
    float z;
    float w;

    Point() noexcept = default;
    Point(float _x, float _y, float _z)noexcept
            :Point{_x,_y,_z,1.0f}
    {
    }
    Point(float _x, float _y, float _z, float _d)noexcept
            :x{_x}
            ,y{_y}
            ,z{_z}
            ,w{ _d}
    {
    }
};

Point operator^( const Plane& p, const Line& l )
{
    return Point{
         p.b * l.m3 - p.c * l.m2 - p.d * l.d3,
        -p.a * l.m3 + p.c * l.m1 - p.d * l.d2,
         p.a * l.m2 - p.b * l.m1 - p.d * l.d1,
         p.a * l.d3 + p.b * l.d2 + p.c * l.d1
    };
}
</code></pre>
<pre><code class="language-cpp">struct Point
{
    vec4 pos;

    Point() noexcept = default;
    Point(float _x, float _y, float _z)noexcept
            :pos{_x,_y,_z,1.0f}
    {
    }
    Point(float _x, float _y, float _z, float _d)noexcept
            :pos{_x,_y,_z,_d}
    {
    }
};







Point operator^( const Plane& p, const Line& l )
{
    return Point{
         p.dir.y * l.m.z - p.dir.z * l.m.y - p.dist  * l.d.z,
        -p.dir.x * l.m.z + p.dir.z * l.m.x - p.dist  * l.d.y,
         p.dir.x * l.m.y - p.dist  * l.m.x - p.dist  * l.d.x,
         p.dir.x * l.d.z + p.dist  * l.d.y + p.dir.z * l.d.x
    };
}
</code></pre></div>

The only thing we now need to know is the distance between hit point and the ray origin. Luckily, we are working with homogenious coordinates, so that means that we just have to decide the $z$ component of our point with our $w$ component.
Putting it all together we get.

<div style="display: flex;justify-content: space-between;">
<pre class="px-1"><code class="language-cpp">struct Plane
{
    float a,b,c,d;

    Plane() noexcept = default;
    Plane(float _a, float _b, float _c, float _d)noexcept
            :a{_a}
            ,b{_b}
            ,c{_c}
            ,d{_d}
    {
    }
};

struct Line
{
    float m1, m2, m3, m4;  //movement
    float d1, d2, d3, d4;  //direction

    Line() noexcept = default;
    Line( float a, float b, float c, float d, float e, float f ) noexcept
            : d1{ f }
            , d2{ e }
            , d3{ d }
            , d4{ 0.0f }
            , m1{ c }
            , m2{ b }
            , m3{ a }
            , m4{ 0.0f }
    {
    }
};

struct Point
{
    float x;
    float y;
    float z;
    float w;

    Point() noexcept = default;
    Point(float _x, float _y, float _z)noexcept
            :Point{_x,_y,_z,1.0f}
    {
    }
    Point(float _x, float _y, float _z, float _d)noexcept
            :x{_x}
            ,y{_y}
            ,z{_z}
            ,w{ _d}
    {
    }
};

Point operator^( const Plane& p, const Line& l )
{
    return Point{
         p.b * l.m3 - p.c * l.m2 - p.d * l.d3,
        -p.a * l.m3 + p.c * l.m1 - p.d * l.d2,
         p.a * l.m2 - p.b * l.m1 - p.d * l.d1,
         p.a * l.d3 + p.b * l.d2 + p.c * l.d1
    };
}

void Render()
{
    const std::array<Plane, 6> planes{
            Plane{ 0, 1, 0, -5 },
            Plane{ 0, -1, 0, -5 },
            Plane{ 1, 0, 0, -5 },
            Plane{ -1, 0, 0, -5 },
            Plane{ 0, 0, 1, -10 },
            Plane{ 0, 0, -1, -5 }
        };
    const std::array<Color, 6> colors{
            Color{ 1, 0, 0 },
            Color{ 0, 1, 1 },
            Color{ 0, 1, 0 },
            Color{ 1, 0, 1 },
            Color{ 0, 0, 1 },
            Color{ 1, 1, 0 }
        };

    for ( uint32_t row{}; row < m_windowHeight; ++row )
    {
        for ( uint32_t column{}; column < m_windowWidth; ++column )
        {
            float x = ( 2.f * (( 0.5f + (float) column ) * inverseWidth ) - 1.f ) * m_camera.aspectRatio * m_camera.fieldOfView;
            float y = ( 1.f - 2.f * (( 0.5f + (float) row ) * inverseHeight )) * m_camera.fieldOfView;

            Line ray{ 0, 0, 0, x, y, -1 };
            Color         finalColor{};
            float         closest{ 1e6f };
            for ( uint8_t i{}; i < 6; ++i )
            {
                Point intersection = ray ^ objects[i];
                float distance{ intersection.z / intersection.w };
                if ( distance < closest && distance > 0 )
                {
                    finalColor = colors[i];
                    closest    = distance;
                }
            }
            WriteColor(column, row, finalColor );
        }
    }
}
</code></pre>
<pre class="px-1"><code class="language-cpp">struct Plane
{
    vec3 dir
    float dist;

    Plane() noexcept = default;
    Plane(float a, float b, float c, float d)noexcept
            :dir{ a, b, c }
            ,dist{d}
    {
    }
};


struct Line
{
    vec4 m;  //movement
    vec4 d;  //direction

    Line() noexcept = default;
    Line( float a, float b, float c, float d, float e, float f ) noexcept
            : d{ f, e, d, 0.0f }
            , m{ c, b, a, 0.0f }
    {
    }
};







struct Point
{
    vec4 pos;

    Point() noexcept = default;
    Point(float _x, float _y, float _z)noexcept
            :pos{_x,_y,_z,1.0f}
    {
    }
    Point(float _x, float _y, float _z, float _d)noexcept
            :pos{_x,_y,_z,_d}
    {
    }
};







Point operator^( const Plane& p, const Line& l )
{
    return Point{
         p.dir.y * l.m.z - p.dir.z * l.m.y - p.dist  * l.d.z,
        -p.dir.x * l.m.z + p.dir.z * l.m.x - p.dist  * l.d.y,
         p.dir.x * l.m.y - p.dist  * l.m.x - p.dist  * l.d.x,
         p.dir.x * l.d.z + p.dist  * l.d.y + p.dir.z * l.d.x
    };
}

void Render()
{
    const std::array<Plane, 6> planes{
            Plane{ 0, 1, 0, -5 },
            Plane{ 0, -1, 0, -5 },
            Plane{ 1, 0, 0, -5 },
            Plane{ -1, 0, 0, -5 },
            Plane{ 0, 0, 1, -10 },
            Plane{ 0, 0, -1, -5 }
        };
    const std::array<Color, 6> colors{
            Color{ 1, 0, 0 },
            Color{ 0, 1, 1 },
            Color{ 0, 1, 0 },
            Color{ 1, 0, 1 },
            Color{ 0, 0, 1 },
            Color{ 1, 1, 0 }
        };

    for ( uint32_t row{}; row < m_windowHeight; ++row )
    {
        for ( uint32_t column{}; column < m_windowWidth; ++column )
        {
            float x = ( 2.f * (( 0.5f + (float) column ) * inverseWidth ) - 1.f ) * m_camera.aspectRatio * m_camera.fieldOfView;
            float y = ( 1.f - 2.f * (( 0.5f + (float) row ) * inverseHeight )) * m_camera.fieldOfView;

            Line ray{ 0, 0, 0, x, y, -1 };
            Color         finalColor{};
            float         closest{ 1e6f };
            for ( uint8_t i{}; i < 6; ++i )
            {
                Point intersection = ray ^ objects[i];
                float distance{ intersection.z / intersection.w };
                if ( distance < closest && distance > 0 )
                {
                    finalColor = colors[i];
                    closest    = distance;
                }
            }
            WriteColor(column, row, finalColor );
        }
    }
}
</code></pre></div>

![../assets/img/Blogs/GART/PlaneRay.bmp](assets/img/Blogs/GART/PlaneRay.bmp)