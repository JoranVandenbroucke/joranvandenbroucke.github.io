## About

The software ray tracer is a 2nd-year Game Developer assignment where each student makes their ray tracer using Visual Studio, C++, SDL2, SDL2_image and Perforce. The assignment says that there need to be 2 scenes, 1 scene with 3 triangles rotating and having a different cull mode. We also needed to have 3 dielectric spheres, with a roughness of 0, 0.5 and 1 respectively and 3 metallic spheres, with a roughness of 0, 0.5 and 1 respectively. The second scene needed to have the low poly Stanford bunny provided by the teacher. Both scenes needed to have a directional light and at least 2 point lights with real-time direct hard shadows.

I also added texture support.

## Ray Sphere Intersection

```cpp
bool Sphere( const Ray& ray, const float3& center, float radius, float& t )
{
t = 0.0f;
//radius power 2
float r2 = radius * radius;
//camera sphere vector
float l = center - ray.origine;
//look how mush of the vector is on the direction vector
float s = dot( l, ray.direction );
float l2 = sqrMagnitude( l );
//pointing away
if( s < 0 && l2 > r2 )
return false;
//part of ray that is perpendicular to tvec
float m2 = l2 - s * s;
if( m2 > r2 )
return false;
//part of tvec that is within the sphere
float q = sqrtf( r2 - m2 );
if( l2 > r2 )
t = s - q;
else
t = s + q;
if( t < ray.tMin || t > ray.tMax )
return false;
return true;
}
```

## Ray Plane Intersection

```cpp
bool Plane( const Ray& ray, const float3& center, const float3& normal, float& t )
{
float dotDN{ dot( ray.direction, normal ) };
//if paralel with plane
if( ( dotDN > 1e-5f )
return false;

    //calculate distance
    float dotPRN{ dot( center - ray.origine, normal ) };
    t = dotPRN / dotDN;

    //if behind camera or beyond draw distance
    if( t > ray.tMax || t < ray.tMin )
        return false;

    return true;
}

```

## Ray Triangle Intersection

My ray triangle intersection is based on the paper "Fast Ray-Axis Aligned Bounding Box Overlap Tests with Plücker Coordinates" from Jeffrey Mahovsky and Brian Wyvill

```cpp
bool Triangle( const Ray& ray, const Vertex& v0, const Vertex& v1, const Vertex& v2, float3& normal, float& t )
{
    float BA[6], CB[6], AC[6], PR[6];
    Plucker::PointsToPlucker( v1.position, v0.position, BA );
    Plucker::PointsToPlucker( v2.position, v1.position, CB );
    Plucker::PointsToPlucker( v0.position, v2.position, AC );
    Plucker::RayToPlucker( ray.origine, ray.direction, PR );

    float w0 = Plucker::Side( PR, CB );
    float w1 = Plucker::Side( PR, AC );
    float w2 = Plucker::Side( PR, BA );

    if( w0 > 0 && w1 > 0 && w2 > 0 )
    {
        float totalW = w0 + w1 + w2;
        w0 /= totalW;
        w1 /= totalW;
        w2 /= totalW;

        auto p = v0.position * w0 + v1.position * w1 + v2.position * w2;
        auto tp = ( p - ray.origine ) * ray.invDirection;
        t = tp.x;
        if( t < ray.tMin || t > ray.tMax )
            return false;
        return true;
    }
    return false;
}
```

## Ray Box Intersection

My ray box intersection is based on the paper "Fast Ray-Axis Aligned Bounding Box Overlap
Tests with Pl&#252cker Coordinates" from Jeffrey Mahovsky and Brian Wyvill

```cpp
      B-------C                    B-------C
     /|      /|                   /        |
    F-|-----G |    &lt;--cubes   F         | &lt;--Test for MMM
    | A-----|-D                  |         D
    |/      |/                   |        /
    E-------H                    E-------H
    Fast Ray-Axis Aligned Bounding Box
    Overlap Tests with Plucker Coordinates

                    
bool Balbino::Intersection::Cube( const Balbino::Ray& ray, const float3& G, const float3& A, float& t )
{
    float pluckerRay[6]{};

    const floatt3 B{ A.x, G.y, A.z };
    const floatt3 C{ G.x, G.y, A.z };
    const floatt3 D{ G.x, A.y, A.z };
    const floatt3 E{ A.x, A.y, G.z };
    const floatt3 F{ A.x, G.y, G.z };
    const floatt3 H{ G.x, A.y, G.z };

    Plucker::RayToPlucker( ray.origine, ray.direction, pluckerRay );

    switch( ray.type )
    {
        case Classification::MMM:
        {
            if( ( ray.origine.x < A.x ) || ( ray.origine.y < A.y ) || ( ray.origine.z < A.z ) )
                return false;

            float BC[6]{};
            float CD[6]{};
            float DH[6]{};
            float HE[6]{};
            float EF[6]{};
            float FB[6]{};

            Plucker::PointsToPlucker( B, C, BC );
            Plucker::PointsToPlucker( C, D, CD );
            Plucker::PointsToPlucker( D, H, DH );
            Plucker::PointsToPlucker( H, E, HE );
            Plucker::PointsToPlucker( E, F, EF );
            Plucker::PointsToPlucker( F, B, FB );

            if( Plucker::Side( pluckerRay, DH ) > 0 ||
                Plucker::Side( pluckerRay, FB ) > 0 ||
                Plucker::Side( pluckerRay, EF ) > 0 ||
                Plucker::Side( pluckerRay, CD ) > 0 ||
                Plucker::Side( pluckerRay, BC ) > 0 ||
                Plucker::Side( pluckerRay, HE ) > 0 )
                return false;

            t = ( G.x - ray.origine.x ) * ray.invDirection.x;
            float t1 = ( G.y - ray.origine.y ) * ray.invDirection.y;
            if( t1 > t )
                t = t1;
            float t2 = ( G.z - ray.origine.z ) * ray.invDirection.z;
            if( t2 > t )
                t = t2;
            return true;
        }
    case Classification::MMP:
    {
        &#8942;
    }
    case Classification::MPM:
    {
        &#8942;
    }
    case Classification::MPP:
    {
        &#8942;
    }
    case Classification::PPP:
    {
        &#8942;
    }
    case Classification::PPM:
    {
        &#8942;
    }
    case Classification::PMP:
    {
        &#8942;
    }
    case Classification::PMM:
    {
        &#8942;
    }
    default:
        break;
    }
    return false;
}
```