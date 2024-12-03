"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BreadcrumbProps {
  pageName: any;
  isGoBack?: boolean;
}
const Breadcrumb = ({ pageName, isGoBack }: BreadcrumbProps) => {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center">
        {isGoBack ? (
          <div>
            <Image
              src="/images/icon/back.png"
              alt="BackIcon"
              className="mr-4 w-5 cursor-pointer"
              width={10}
              height={10}
              onClick={handleBackClick}
            />
          </div>
        ) : null}

        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          {pageName}
        </h2>
      </div>

      <nav>
        <ol className="flex items-center gap-2">
          <li>
            <Link className="font-medium" href="/">
              Dashboard /
            </Link>
          </li>
          <li className="font-medium text-primary">{pageName}</li>
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;
